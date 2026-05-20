import json
import re
import requests
from urllib.parse import urlencode, quote

SEARCH_HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'activityid': 'v4_zt_2022_music',
    'appid': 'ce',
    'channel': '014X031',
    'connection': 'keep-alive',
    'deviceid': 'E60C6B2F-7F11-4362-9FCE-6F1CC86E0F18',
    'host': 'c.musicapp.migu.cn',
    'hwid': '',
    'imei': '',
    'h5page': '',
    'imsi': '',
    'location-info': '',
    'mgm-user-agent': '',
    'oaid': '',
    'uid': '',
    'location-data': '',
    'logid': 'h5page[1808]',
    'mgm-network-operators': '02',
    'mgm-network-standard': '03',
    'mgm-network-type': '03',
    'origin': 'https://y.migu.cn',
    'recommendstatus': '1',
    'referer': 'https://y.migu.cn/app/v4/zt/2022/music/index.html',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'subchannel': '014X031',
    'test': '00',
    'ua': 'Android_migu',
    'version': '6.8.8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
}

MUSIC_QUALITIES = {
    'LQ': 'mp3',    # 低品质 Low Quality
    'PQ': 'mp3',    # 普通品质 Plain Quality
    'HQ': 'mp3',    # 高品质 High Quality
    'SQ': 'flac',   # 超品质 Super Quality
    'ZQ': 'flac',   # 臻品品质
    'Z3D': 'flac',  # 臻品3D
    'ZQ24': 'flac', # 臻品24bit
    'ZQ32': 'flac', # 臻品32bit
}


def parse_size(value):
    raw = str(value if value is not None else '').replace('MB', '').strip()
    try:
        num = float(raw)
        return num
    except (ValueError, TypeError):
        return 0


def build_search_url(keyword, page_no=1, page_size=20):
    search_switch = "{'song': 1, 'album': 0, 'singer': 0, 'tagSong': 1, 'mvSong': 0, 'bestShow': 1}"
    params = {
        'text': keyword,
        'pageNo': str(page_no),
        'pageSize': str(page_size),
        'isCopyright': '1',
        'sort': '1',
        'searchSwitch': search_switch,
    }
    return f'https://c.musicapp.migu.cn/v1.0/content/search_all.do?{urlencode(params)}'


def build_listen_url(content_id, copyright_id, resource_type, tone_flag):
    return (
        'https://c.musicapp.migu.cn/MIGUM3.0/strategy/listen-url/v2.4'
        f'?resourceType={resource_type}'
        '&netType=01'
        '&scene='
        f'&toneFlag={tone_flag}'
        f'&contentId={content_id}'
        f'&copyrightId={copyright_id}'
        f'&lowerQualityContentId={content_id}'
    )


def fallback_url(content_id, copyright_id, tone_flag, resource_type):
    return (
        'https://app.pd.nf.migu.cn/MIGUM3.0/v1.0/content/sub/listenSong.do'
        f'?channel=mx&copyrightId={copyright_id}'
        f'&contentId={content_id}'
        f'&toneFlag={tone_flag}'
        f'&resourceType={resource_type}'
        '&userId=15548614588710179085069'
        '&netType=00'
    )


def build_id(content_id=None, copyright_id=None):
    if not content_id or not copyright_id:
        return ''
    return f'{content_id}_{copyright_id}'


def parse_id(id_str):
    parts = id_str.split('_')
    content_id = parts[0] if len(parts) > 0 else ''
    copyright_id = parts[1] if len(parts) > 1 else ''
    return content_id, copyright_id


class MiguProvider:
    def __init__(self):
        self.name = 'migu'

    def search(self, query):
        try:
            url = build_search_url(query)
            response = requests.get(url, headers=SEARCH_HEADERS, timeout=15)
            data = response.json()
            list_ = (data.get('songResultData') or {}).get('result') or []
            result = []
            for item in list_:
                content_id = item.get('contentId')
                copyright_id = item.get('copyrightId')
                id_ = build_id(content_id, copyright_id)
                artist = ', '.join(
                    s.get('name') for s in (item.get('singers') or []) if s and s.get('name')
                )
                album = ', '.join(
                    a.get('name') for a in (item.get('albums') or []) if a and a.get('name')
                )
                cover_items = item.get('imgItems') or []
                cover = cover_items[-1].get('img') if cover_items else None
                music_item = {
                    'id': id_,
                    'title': item.get('name') or '未知歌曲',
                    'artist': artist or '未知歌手',
                    'album': album or None,
                    'cover': cover,
                    'provider': self.name,
                }
                if music_item['id']:
                    result.append(music_item)
            return result
        except Exception as error:
            print(f'Migu search error: {error}')
            return []

    def get_play_info(self, id_str):
        try:
            content_id, copyright_id = parse_id(id_str)
            if not content_id or not copyright_id:
                raise ValueError('Invalid id')
            response = requests.get(build_search_url(content_id, 1, 1), headers=SEARCH_HEADERS, timeout=15)
            data = response.json()
            list_ = (data.get('songResultData') or {}).get('result') or []
            song = None
            for item in list_:
                if item.get('contentId') == content_id:
                    song = item
                    break
            if song is None and list_:
                song = list_[0]
            if not song:
                raise ValueError('Song not found')
            rate_formats = (song.get('rateFormats') or []) + (song.get('newRateFormats') or [])
            sorted_formats = sorted(
                [r for r in rate_formats if r and r.get('formatType') and r.get('resourceType')],
                key=lambda r: parse_size(r.get('size') or r.get('iosSize') or r.get('androidSize')),
                reverse=True,
            )
            for rate in sorted_formats:
                try:
                    url = build_listen_url(content_id, copyright_id, rate['resourceType'], rate['formatType'])
                    resp = requests.get(url, headers=SEARCH_HEADERS, timeout=15)
                    info = resp.json() if resp.text else {}
                    url_from_api = (info.get('data') or {}).get('url') or fallback_url(content_id, copyright_id, rate['formatType'], rate['resourceType'])
                    if not url_from_api:
                        continue
                    fixed_url = re.sub(r'(?<=/)MP3_128_16_Stero(?=/)', 'MP3_320_16_Stero', url_from_api)
                    type_ = MUSIC_QUALITIES.get(rate['formatType'], 'mp3')
                    return {
                        'url': fixed_url,
                        'type': type_,
                        'bitrate': rate['formatType'],
                    }
                except Exception:
                    continue
            raise RuntimeError('Failed to get play url')
        except Exception as error:
            print(f'Migu getPlayInfo error: {error}')
            raise


if __name__ == '__main__':
    print('=== Migu Music Provider ===')
    provider = MiguProvider()

    while True:
        print('\n--- 操作方式 ---')
        print('[0] 通过ID直接获取播放地址')
        print('[1] 通过关键词搜索歌曲')
        mode = input('请选择 (0/1): ').strip()

        if mode == '0':
            id_str = input('请输入歌曲ID (格式: contentId_copyrightId): ').strip()
            if not id_str or '_' not in id_str:
                print('ID格式无效，应为 contentId_copyrightId')
                continue
            print('\n正在解析...')
            try:
                info = provider.get_play_info(id_str)
                print(f'播放地址: {info["url"]}')
                print(f'格式: {info["type"]}')
                print(f'音质: {info["bitrate"]}')
            except Exception:
                pass
        elif mode == '1':
            query = input('请输入搜索关键词: ').strip()
            if not query:
                print('搜索内容不能为空')
                continue

            print(f'\n正在搜索...')
            results = provider.search(query)
            if not results:
                print('未找到结果')
                continue

            for i, item in enumerate(results, 1):
                print(f'[{i}] {item["title"]} - {item["artist"]}' + (f' ({item["album"]})' if item["album"] else ''))
                print(f'    id: {item["id"]}')
                if item["cover"]:
                    print(f'    cover: {item["cover"]}')

            choice = input('\n输入序号获取播放地址 (直接回车跳过): ').strip()
            if choice.isdigit() and 1 <= int(choice) <= len(results):
                selected = results[int(choice) - 1]
                print(f'\n正在解析: {selected["title"]} - {selected["artist"]}')
                try:
                    info = provider.get_play_info(selected['id'])
                    print(f'播放地址: {info["url"]}')
                    print(f'格式: {info["type"]}')
                    print(f'音质: {info["bitrate"]}')
                except Exception:
                    pass
            elif choice:
                print('无效序号')
        else:
            print('无效选择')
            continue

        again = input('\n是否继续? (y/n, 默认y): ').strip().lower()
        if again == 'n':
            print('再见!')
            break
