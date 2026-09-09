"""One-off helper: from a big candidate list of common characters, find which ones
exist in HUST-OBC, copy an image for each into public/obc/, and print JS-ready info.

Run:
    python scripts/add_common.py

Output:
    - copies images to public/obc/<pinyinless ascii name>.png
    - prints, for each resolved char, a line:  CHAR\tID\tFILENAME
    - prints the list of candidates NOT found so we skip them.
"""
from __future__ import annotations
import json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DECIPHERED = ROOT / "HUST-OBC" / "HUST-OBC" / "deciphered"
OUT = ROOT / "public" / "obc"
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".bmp"}

# Candidate common characters to try to ADD (beyond the ~53 already curated).
# Broad net of frequent, teachable characters; we keep only those present in HUST-OBC.
CANDIDATES = list(dict.fromkeys(
    # numbers / basics
    "四五六七八九十百千萬"
    # people / kinship / body
    "女子父母兄王臣民首自面耳目口手足心血肉骨牙舌毛皮身"
    # nature / weather / geography
    "云雨雪雷風气水火山石田土川州泉谷丘州井天日月星光明夕夜旦"
    # plants / animals
    "禾米竹木林森果華草花牛羊馬犬豕鹿虎象魚鳥燕龍龜隹雞鳳兔鼠豸貝虫"
    # actions / verbs
    "見立行走來去入出上下大小之正止步涉飲食射獵取受得保休"
    # objects / tools / culture
    "刀弓矢戈斤舟車門戶皿鼎鬲爵壺網衣巾帛玉貝金糸文書冊典樂鼓"
    # abstract / common
    "中一二三方圓爲有無同好安家宗祭示福祝夢老死疾采執學教"
    # more nature/structure
    "永州京高門阜广宀穴瓦缶片斗升寸尺工力用臼"
    # animals extra
    "熊猴鹿羔豚燕鴻鶴蟲蛇鹽貝"
    .strip()))

# Manual override for a nicer ascii filename per char (else fall back to id-based).
NAME = {
    "四":"si","五":"wu","六":"liu","七":"qi","八":"ba","九":"jiu","十":"shi_ten",
    "百":"bai","千":"qian","萬":"wan",
    "女":"nv","子":"zi_child","父":"fu","母":"mu_mother","兄":"xiong","王":"wang_king",
    "臣":"chen","民":"min","首":"shou_head","自":"zi","耳":"er","目":"mu_eye","口":"kou",
    "手":"shou_hand","足":"zu","心":"xin","血":"xue","肉":"rou","骨":"gu","牙":"ya",
    "舌":"she_tongue","毛":"mao","皮":"pi","身":"shen",
    "云":"yun_cloud","雨":"yu","雪":"xue_snow","雷":"lei","風":"feng","气":"qi_air",
    "水":"shui","火":"huo","山":"shan","石":"shi_stone","田":"tian","土":"tu","川":"chuan",
    "州":"zhou_region","泉":"quan_spring","丘":"qiu","井":"jing","天":"tian_sky","日":"ri",
    "月":"yue","星":"xing","光":"guang","明":"ming","夕":"xi","旦":"dan","夜":"ye",
    "禾":"he","米":"mi","竹":"zhu","木":"mu","林":"lin","森":"sen","果":"guo_fruit",
    "華":"hua","草":"cao","花":"hua_flower","牛":"niu","羊":"yang","馬":"ma","犬":"quan",
    "豕":"shi_pig","鹿":"lu","虎":"hu","象":"xiang","魚":"yu_fish","鳥":"niao","燕":"yan",
    "龍":"long","龜":"gui","隹":"zhui","雞":"ji","鳳":"feng_phoenix","兔":"tu_rabbit",
    "鼠":"shu","豸":"zhi","貝":"bei","虫":"chong",
    "見":"jian","立":"li_stand","行":"xing_walk","走":"zou","來":"lai","去":"qu","入":"ru",
    "出":"chu","上":"shang","下":"xia","大":"da","小":"xiao","之":"zhi","正":"zheng",
    "止":"zhi_stop","步":"bu","涉":"she","飲":"yin","食":"shi_eat","射":"she_shoot",
    "取":"qu_take","受":"shou_receive","得":"de","保":"bao","休":"xiu",
    "刀":"dao","弓":"gong","矢":"shi_arrow","戈":"ge","斤":"jin","舟":"zhou","車":"che",
    "門":"men","戶":"hu_door","皿":"min","鼎":"ding","鬲":"li_cauldron","爵":"jue",
    "壺":"hu_pot","網":"wang","衣":"yi","巾":"jin","帛":"bo","玉":"yu_jade","金":"jin_metal",
    "糸":"mi_silk","文":"wen","書":"shu","冊":"ce","典":"dian","樂":"yue_music","鼓":"gu_drum",
    "中":"zhong","一":"yi_one","二":"er_two","三":"san","方":"fang","圓":"yuan","爲":"wei",
    "有":"you","無":"wu_none","同":"tong","好":"hao","安":"an","家":"jia","宗":"zong",
    "祭":"ji_sacrifice","示":"shi_altar","福":"fu_luck","祝":"zhu","夢":"meng","老":"lao",
    "死":"si_death","疾":"ji_illness","采":"cai","執":"zhi_hold","學":"xue","教":"jiao",
    "永":"yong","京":"jing_capital","高":"gao","阜":"fu_mound","广":"guang_shelter",
    "宀":"mian","穴":"xue_cave","瓦":"wa","缶":"fou","片":"pian","斗":"dou","升":"sheng",
    "寸":"cun","尺":"chi","工":"gong_work","力":"li","用":"yong","臼":"jiu_mortar",
    "熊":"xiong_bear","猴":"hou","鶴":"he_crane","鴻":"hong","蛇":"she_snake","鹽":"yan_salt",
    "面":"mian_face","豚":"tun",
}

def first_image(folder: Path):
    imgs = sorted(p for p in folder.iterdir() if p.suffix.lower() in IMAGE_EXTS)
    return imgs[0] if imgs else None

def main():
    mapping = json.loads((DECIPHERED / "chinese_to_ID.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    found, missing, noimg = [], [], []
    used_names = set()
    for ch in CANDIDATES:
        if ch not in mapping:
            missing.append(ch); continue
        _id = str(mapping[ch])
        # folder may be merged e.g. 0011_0012_0013 — find the folder that contains id
        folder = None
        if (DECIPHERED / _id).is_dir():
            folder = DECIPHERED / _id
        else:
            for d in DECIPHERED.iterdir():
                if d.is_dir() and _id in d.name.split("_"):
                    folder = d; break
        if not folder:
            noimg.append((ch, _id, "no folder")); continue
        img = first_image(folder)
        if not img:
            noimg.append((ch, _id, "empty folder")); continue
        name = NAME.get(ch) or f"c{_id}"
        base = name; k = 2
        while name in used_names:
            name = f"{base}{k}"; k += 1
        used_names.add(name)
        fn = f"{name}.png"
        shutil.copyfile(img, OUT / fn)
        found.append((ch, _id, fn))

    lines = ["=== FOUND (char\tID\tfile) ==="]
    for ch, _id, fn in found:
        lines.append(f"{ch}\t{_id}\t{fn}")
    lines.append(f"\n=== NOT IN DATASET ({len(missing)}) ===")
    lines.append(" ".join(missing))
    lines.append(f"\n=== NO IMAGE ({len(noimg)}) ===")
    lines.append(" ".join(f"{ch}({_id}:{why})" for ch, _id, why in noimg))
    lines.append(f"\nTOTAL FOUND: {len(found)}")
    report = ROOT / "scripts" / "add_common_report.txt"
    report.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote report to {report} — {len(found)} found, "
          f"{len(missing)} not in dataset, {len(noimg)} no image.")

if __name__ == "__main__":
    main()
