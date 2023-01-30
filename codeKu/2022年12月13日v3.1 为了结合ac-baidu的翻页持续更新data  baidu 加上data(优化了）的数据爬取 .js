// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       本爷有空
// @connect    google.com
// @connect    google.com.hk
// @connect    google.com.jp
// @connect    baidu.com
// @include    *://ipv6.baidu.com/*
// @include    *://www.baidu.com/*
// @include    *://www1.baidu.com/*
// @include    *://m.baidu.com/*
// @include    *://xueshu.baidu.com/s*
// @exclude    https://zhidao.baidu.com/*
// @exclude    https://*.zhidao.baidu.com/*
// @exclude    https://www.baidu.com/img/*
// @include    *://encrypted.google.*/search*
// @include    *://*.google*/search*
// @include    *://*.google*/webhp*
// @match        *www.google.com*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codechef.com
// @require     https://d3js.org/d3.v4.js
// @require     http://cdn.bootcss.com/jquery/2.1.4/jquery.min.js
// @require     http://cdn.bootcss.com/bootstrap/3.3.4/js/bootstrap.min.js
// @resource    http://cdn.bootcss.com/bootstrap/3.3.4/css/bootstrap.min.css
// @grant        none
// ==/UserScript==
let styleSheet = `
 body {
       background-color: #272b30;
       padding: 30px 40px;
       text-align: center;
       font-family: OpenSans-Light, PingFang SC, Hiragino Sans GB, Microsoft Yahei, Microsoft Jhenghei, sans-serif;
   }

   .links line {
       stroke: rgb(240, 240, 240);
       stroke-opacity: 0.2;
   }

   .links line.inactive {
       stroke-opacity: 0;
   }

   .nodes circle {
       stroke: #fff;
       stroke-width: 1.5px;
   }

   .nodes circle:hover {
       cursor: pointer;
   }

   .nodes circle.inactive {
       display: none !important;
   }


   .texts text {
       display: none;
   }

   .texts text:hover {
       cursor: pointer;
   }

   .texts text.inactive {
       display: none !important;
   }

   #indicator {
       position: absolute;
       left: 60px;
       bottom: 120px;
   }

   #indicator {
       text-align: left;
       color: #f2f2f2;
       font-size: 12px;
   }

   #indicator > div {
       margin-bottom: 4px;
   }

   #indicator span {
       display: inline-block;
       width: 30px;
       height: 14px;
       position: relative;
       top: 2px;
       margin-right: 8px;
   }

   #mode {
       position: absolute;
       top: 160px;
       left: 60px;
   }

   #mode span {
       display: inline-block;
       border: 1px solid #fff;
       color: #fff;
       padding: 6px 10px;
       border-radius: 4px;
       font-size: 14px;
       transition: color, background-color .3s;
       -o-transition: color, background-color .3s;
       -ms-transition: color, background-color .3s;
       -moz-transition: color, background-color .3s;
       -webkit-transition: color, background-color .3s;
   }

   #mode span.active,
   #mode span:hover {
       background-color: #fff;
       color: #333;
       cursor: pointer;
   }

   #search1 input {
       position: absolute;
       top: 220px;
       left: 60px;
       color: #fff;
       border: none;
       outline: none;
       box-shadow: none;
       width: 200px;
       background-color: #666;
   }

   #info {
       position: absolute;
       bottom: 40px;
       right: 30px;
       text-align: right;
       width: 270px;
   }

   #info h4 {
       color: #fff;
   }

   #info p {
       color: #fff;
       font-size: 12px;
       margin-bottom: 5px;
   }

   #info p span {
       color: #888;
       margin-right: 10px;
   }

   #svg g.row:hover {
       stroke-width: 1px;
       stroke: #fff;
   }
`;

let s = document.createElement('style');
s.type = "text/css";
s.innerHTML = styleSheet;
(document.head || document.documentElement).appendChild(s);

// window.addEventListener('load', function() {   //是否可以listen别的
    window.addEventListener('scroll', function() {  //改成滚动的时候就触发？或者滚动多次
    const xmlns = "http://www.w3.org/2000/svg";
    const width=800;
    const height=560;
    var svg1 = document.createElementNS(xmlns, "svg");
    svg1.setAttributeNS(null,'id',"svg1");
    svg1.setAttributeNS(null,"width",width);
    svg1.setAttributeNS(null,"height",height);


    svg1.innerHTML = '<svg width="800" height="560" style="margin-left:80px;margin-bottom:-40px;" id="svg"></svg><div id="indicator"></div><div id="mode"><span class="active" style="border-top-right-radius: 0;border-bottom-right-radius:0;">节点</span><span style="border-top-left-radius:0;border-bottom-left-radius:0;position: relative;left: -5px">文字</span></div><div id="search1"><input type="text" class="form-control"></div><div id="info"><h4></h4></div></div>';
    document.body.insertBefore(svg1, document.body.firstChild);

    $(document).ready(function () {
        var svg = d3.select("#svg"),
            width = svg.attr("width"),
            height = svg.attr("height");

        //remember its, not . var svg from d3,width,height from svg

        // console.log(svg);
        //        alter:define the (category)
        var types = ['中心文章', '分段', '关键分词', '搜索结果'];
        var colors = ['#6ca46c', '#4e88af', '#c72eca', '#d2907c'];
        //临时大小控制
        var sizes = [30, 5, 10, 2.5];


        var forceRate = 50;


        var simulation = d3.forceSimulation()
        //key makethe link follow id as indicator to find nodes
        .force("link", d3.forceLink().id(function (d) {
            return d.id;

        }))
        .force("charge", d3.forceManyBody())
        //centre setting up
        .force("center", d3.forceCenter(width / 2, height / 2));

        //试着改变力图的nodes吸引力和排斥力
        // simulation.alphaDecay(0.05) // 衰减系数，值越大，图表稳定越快
        simulation.force('charge')
            .strength(-forceRate) // 排斥力强度，正值相互吸引，负值相互排斥
        // simulation.force('link')
        //     .id(d => d.id) // set id getter
        //     .distance(100) // 连接距离
        //     .strength(1) // 连接力强度 0 ~ 1
        //     .iterations(1) // 迭代次数


        //    <!--    loading data-->
        var graph;
        // d3.json("new.json", function (error, data) {
        // d3.json("nodesAndLinks.json", function (error, data) {
        // if (error) throw error;
        //let data={"nodes":[{"category":1,"id":"news","name":"韩美娟百因必有果你的报应就是我林自勇就是牛逼","value":0,"type":"news"},{"category":2,"id":"tag1","type":"tag","name":"百因必有果你的报应就是我","value":0},{"category":2,"id":"tag2","type":"tag","name":"百因必有果","value":0},{"category":2,"id":"tag3","type":"tag","name":"你的报应就是我","value":0},{"category":2,"id":"tag6","type":"tag","name":"百因必有果 你的报应就是我","value":0},{"category":2,"id":"tag8","type":"tag","name":"韩美娟百因必有果你的报应就是我","value":0},{"category":2,"id":"tag10","type":"tag","name":"百因必有果是","value":0},{"category":2,"id":"tag15","type":"tag","name":"百因必有果韩美娟","value":0},{"category":2,"id":"tag17","type":"tag","name":"韩美娟 百因必有果你的报应就是我","value":0},{"category":2,"id":"tag19","type":"tag","name":"你的报应就是我韩美娟 百因必有果","value":0},{"category":2,"id":"tag20","type":"tag","name":"你的报应就是韩美娟","value":0},{"category":2,"id":"tag22","type":"tag","name":"韩美娟你就是","value":0},{"category":2,"id":"tag24","type":"tag","name":"你的报应就","value":0},{"category":2,"id":"tag25","type":"tag","name":"韩美娟你的报应就是我","value":0},{"category":2,"id":"tag29","type":"tag","name":"你的报应就是我韩美娟","value":0},{"category":2,"id":"tag30","type":"tag","name":"韩美娟 百因必有果","value":0},{"category":2,"id":"tag31","type":"tag","name":"韩美娟 百因必有果 你的报应就是我","value":0},{"category":2,"id":"tag32","type":"tag","name":"韩美娟百因必有果","value":0},{"category":2,"id":"tag34","type":"tag","name":"因必有果你的报应就是我","value":0},{"category":2,"id":"tag38","type":"tag","name":"必有果你的报应就是我","value":0},{"category":2,"id":"tag41","type":"tag","name":"百因必有果 你的报应就是韩美娟","value":0},{"category":2,"id":"tag43","type":"tag","name":"你的报应就是","value":0},{"category":2,"id":"tag44","type":"tag","name":"你的报应我","value":0},{"category":2,"id":"tag46","type":"tag","name":"就是我的报应","value":0},{"category":3,"id":"key0","name":"韩美娟","value":"30000","type":"key"},{"category":3,"id":"key4","name":"你的","value":"30004","type":"key"},{"category":3,"id":"key5","name":"因必有果","value":"30005","type":"key"},{"category":3,"id":"key7","name":"就是","value":"30007","type":"key"},{"category":3,"id":"key9","name":"逼逼","value":"30009","type":"key"},{"category":3,"id":"key11","name":"必有果","value":"30011","type":"key"},{"category":3,"id":"key12","name":"报应是我","value":"30012","type":"key"},{"category":3,"id":"key13","name":"韩美娟的","value":"30013","type":"key"},{"category":3,"id":"key14","name":"韩美","value":"30014","type":"key"},{"category":3,"id":"key16","name":"果你","value":"30016","type":"key"},{"category":3,"id":"key18","name":"韩美娟你","value":"30018","type":"key"},{"category":3,"id":"key21","name":"你就是","value":"30021","type":"key"},{"category":3,"id":"key23","name":"韩美娟是","value":"30023","type":"key"},{"category":3,"id":"key26","name":"报应","value":"30026","type":"key"},{"category":3,"id":"key27","name":"是我","value":"30027","type":"key"},{"category":3,"id":"key28","name":"韩","value":"30028","type":"key"},{"category":3,"id":"key33","name":"你的报应","value":"30033","type":"key"},{"category":3,"id":"key35","name":"有果","value":"30035","type":"key"},{"category":3,"id":"key36","name":"因","value":"30036","type":"key"},{"category":3,"id":"key37","name":"您的","value":"30037","type":"key"},{"category":3,"id":"key39","name":"就是你的","value":"30039","type":"key"},{"category":3,"id":"key40","name":"果报应","value":"30040","type":"key"},{"category":3,"id":"key42","name":"百因必有","value":"30042","type":"key"},{"category":3,"id":"key45","name":"就是我","value":"30045","type":"key"},{"category":4,"id":"san0","name":"韩美娟男装照片曝光,颜值逆天,网友:百因必有果你的报应就是我","value":"2019年9月12日 - 最近一个打扮的非常“奇葩”的网红叫韩美娟,用一口独特的京味普通话说出了“百因必有果,你的报应就是我”走红网络,让他很快就受到粉丝的关注,几乎只...","origin":"baidu.com","time":"2019年9月12日 - ","year":"2019","url":"http://www.baidu.com/link?url=O0GewrYnpMisjGzqU3aR3DWhLxWsh6uDCf80-VkesCAD1esp9U0nCCowVACufsB1ZfhxbuJgOb8aMQhZRfiUA_","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san1","name":"“百因必有果,你的报应就是我”韩美娟有多魔性?!【抖册吧】_百度...","value":"2019年9月5日 - 而且不光如此,抖音每隔一段时间就会出现一个梗,相信喜欢玩抖音的网友都知道,最近打开抖音都被一句“百因必有果,你的报应就是我”给刷屏了,很多人都画...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=e2lyCAvRC8NZBWFRSg-7PS6M0HNVfWA2DcTLu24ShLkq7axbu-HqpjdlGfGuy1UT","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san2","name":"[韩美娟]百因必有果,你的报应就是我_哔哩哔哩 (゜-゜)つロ 干...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san3","name":"当韩美娟踏入你的生活:百因必有果,你的报应就是我,么么哒!","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","你的","百因必有果","你的报应就是我","韩美娟","你的","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san4","name":"【韩美娟】百因必有果,你的报应就是我,记得双击么么哒_哔哩哔哩 (...","value":"(韩美娟)可不可以给我你的微信,记得双击么么哒!!!独宠美娟的血小板 6.8万播放 · 38弹幕 01:55望海因必有果,你的报应就是我,嗯,记得双击么么哒。少年阿...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=fWXZO3RVuzqLPgJ5yuU5UEe3tBNrS_xYMGzqUdENtngYYjkAdb0fmS3zzo9qUpE8gbHTLRoatSiokBMrgAhzzK","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san5","name":"灵魂仿妆韩美娟!百因必有果 你的报应就是我~寄个烧鸡么么哒~","value":"2019年9月21日 - 灵魂仿妆韩美娟!百因必有果 你的报应就是我~寄个烧鸡么么哒~简介 热度59 猜你喜欢 APP内观看 【stitchc7】韩美娟仿妆 | 百因必有果,你的报应就是我 07...","origin":"baidu.com","time":"2019年9月21日 - ","year":"2019","url":"http://www.baidu.com/link?url=bQLDt5r-VYz3-_s57DWkzf1Ql65yh5XGIdh2pbm8XxP9_zxC0D-vRiqNziGuJqI6CtJfUGqDbjTsvzWsiBAE1a","keyWords":["韩美娟","百因必有果 你的报应就是我","韩美娟","百因必有果 你的报应就是我","韩美娟","就是"],"type":"san"},{"category":4,"id":"san6","name":"韩美娟gif表情包_抖音韩美娟百因必有果你的报应就是我图片下载_...","value":"2019年9月6日 - 韩美娟gif表情包,最近被韩美娟疯狂洗脑,百因必有果,你的报应就是我,不服现实碰一碰,看我扎不扎你,不要在网上bb赖赖的,很多人想要这个表情包,下面就和游戏吧小...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=Ah71HxI2__a5nhOleiE-KWHrfearvOJI666nhKE2GIEMMSKx1gbBRHj-kjHMe2UgbDZE4ypBH5t5XJJuA9Vr1K","keyWords":["韩美娟","韩美娟百因必有果你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san7","name":"抖音韩美娟:百因必有果,你的报应就是我_中国企业新闻网","value":"1天前 - 从几年前爆火的艾克里里,到去年大皇子苏喂苏喂,再到如今的韩美娟,网红可谓...“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,不服现...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=PskBrDnRPs4RlbhY1GHfldTSo22dikCccP_pxa2U7VgyFRf9tWdVRLqDNCCJ8bCuImlcEOOlc8n-BAy8ldbBrIo_vcz-qP1-2V2Zrttt1AW","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san8","name":"百因必有果你的报应就是我 出处韩美娟个人资料","value":"2019年9月6日 - 百因必有果你的报应就是我 出处韩美娟个人资料日本整容整形翻译tella 09-06 18:25 投诉 阅读数:94 转发 评论 快速开通微博你可以查看更多内容,还...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=V__S7kliN_IL4LlkTPNzNcv0wiuWHLvGdLo14SbCTj82CQlBg5p0v3Q0KKsC9zgDOMGX9Jk8cpob3xU2msOghThVFQ1xKPrgWa9GzCpaUw_","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san9","name":"韩美娟表情包|百因必有果你的报应就是我_手机搜狐网","value":"百因必有果你的报应就是我 你的报应就是我 你看我扎不扎你就完了 你帮我你不帮我 你帮帮我我帮你你不帮我我还帮你 我帮了你你还骂我,那我就扎你 我...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV6A-wYg1ZXJhwi8nEGpZVKCXZv16KHHuDHSHnTK-wM7Sz_","keyWords":["韩美娟","百因必有果你的报应就是我","百因必有果你的报应就是我","就是"],"type":"san"},{"category":4,"id":"san10","name":"天雷滚滚【韩美娟】横空出世!百因必有果 你的报应就是我!","value":"2019年9月15日 - 天雷滚滚【韩美娟】横空出世!百因必有果 你的报应就是我!是原创类高清视频,于2019-09-15上映,视频画面清晰,播放流畅,内容质量高。视频主要内容:null...","origin":"baidu.com","time":"2019年9月15日 - ","year":"2019","url":"http://www.baidu.com/link?url=5CBowgnopuIovZWJxTG5PwxC8-jsu231kIip1rNcWUj2cs0bzeY5ynHIUOi4HgQn","keyWords":["韩美娟","百因必有果 你的报应就是我","韩美娟","百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san11","name":"假如你身边的朋友像韩美娟,百因必有果,你的报应就是我!_好看视频","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san12","name":"韩美娟今天要模仿谁,百因必有果,你的报应就是我-搞笑-高清正版...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san13","name":"当被韩美娟洗脑后,我变成了这样.百因必有果,你的报应就是我","value":"2019年9月10日 - 当被韩美娟洗脑后,我变成了这样.百因必有果,你的报应就是我是搞笑类高清视频,于2019-09-10上映,视频画面清晰,播放流畅,内容质量高。视频主要内容:...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=WS03kAEXNav_2mWTwSP4z7rPxKohfW8T0GF16jLx6C--9ftQCptwppmx05xSJrTQ","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san14","name":"韩美娟表情包:百因必有果,你的报应就是我","value":"2019年9月10日 - 今日表情包主题:韩美娟表情包 韩美娟的“百因必有果,你的报应就是我” 实在是太上头了 简直自带语音效果 是时候把这些表情包分享出来了! 猜你想要...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=pSUAuy20_bvgSZyxKRaTZzVY29-6Imqm8H_uolyljnYK-FH6lYOlbsUwLA1SjlJCjBOOhVY7kh91YJg_x8Embq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san15","name":"韩美娟经典台词:百因必有果,你的报应就是我!-娱乐-高清正版视...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san16","name":"百因必有果,你的报应就是我_韩美娟","value":"2019年9月14日 - 然后我了解到韩老师是个不可多得的人才,到现在还记得视频里有一句话是:来左边一起百因必有果,其实你的报应就是我。就像明星一有点什么事,网友们就在网...","origin":"baidu.com","time":"2019年9月14日 - ","year":"2019","url":"http://www.baidu.com/link?url=-9UG0DphADuVkuzzMSpP1G2XSCs3r5m4JUQv_-Q-Q8jopU7XCQPr8DxZPsA_4bbr","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san17","name":"[韩美娟]百因必有果,你的报应就是我_哔哩哔哩 (゜-゜)つロ 干...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san18","name":"假如男朋友像韩美娟,百因必有果,你的报应就是我!_腾讯视频","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san19","name":"超级网红韩美娟:“百因必有果,你的报应就是我”","value":"超级网红韩美娟:“百因必有果,你的报应就是我”蜗牛奔跑 不要停止奔跑,不要...有钱哥哥(魏无羡蓝忘机) 卸妆后好帅啊,可以去当演员 志林 I Will Be ...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=fvGSBq5NeKyy7mgnEN4Mdd2P8HfK03ybzzOxuU0Y17Td54nQWB6_6-Z00FU_uw4ohbJMjtKq4KrRHfplRopxuK","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san20","name":"抖音韩美娟gif动态表情包大全_抖音百因必有果你的报应就是我表情...","value":"2019年9月9日 - 最近韩美娟火了,她在抖音里说“百因必有果,你的报应就是我”表情包也跟着火起来了,很多小伙伴都在找这组表情包,下面66小编就为大家带来了韩美娟gif动...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=seUzu-w-TEYsSLforsBdKd6r_Ummx9WKscCVzwTjCmZvf_FzdDSNTsGGlD4mwglT","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san21","name":"抖音百因必有果是什么梗 百因必有果你的报应就是我出处含义","value":"2019年9月10日 - 最近抖音上有一句特别火的话“百因必有果,你的报应就是我”,这句话是抖音上一位叫韩美娟的人说火的,很多网友都被他一脸夸张的欧美妆加上怪异的嗓音成...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=4toE_vaSt89U8Y5kjLWYbKA9RlcKzPRZmNaeRSOFMu_YNzRP_j6ZtNTGdzji4wWJ","keyWords":["百因必有果是","百因必有果你的报应就是我","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san22","name":"“百因必有果,你的报应就是我!”说出这话的韩美娟在现实中是怎样...","value":"最佳答案: 你最近有没有被“百果必有果,报应是我”这句话洗脑?别说你不是。反正我也不会相信的。韩美娟的另一种搞笑方式,其实隐藏着当代人日益增长的生活压力。...\n更多关于韩美娟百因必有果你的报应就是我林自勇就是牛逼的问题>>","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=oLvLhlfAS2la2CQRyKLKuINhSAU7H6prndrXqKRH3aHDkNmRrGff_QBN7iuBi4VhAT3dkCcATJQaGsvUxL77NHNZdaQ3mVeQGZNkVOvoum7","keyWords":["百因必有果","你的报应就是我","韩美娟","必有果","报应是我","韩美娟的"],"type":"san"},{"category":4,"id":"san23","name":"百因必有果你的报应就是我真实含义来了!原出处作者韩美娟是男的!","value":"2019年9月10日 - 现在抖音火了老多梗了,最近比较流行的就是百因必有果,你的报应就是我。咱们今天从语文和逻辑的角度来分析这句话是什么意思。 OK,解释之前,先让...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=V5Qt2UsfYKN0aK3mD84jKX68q671vdGv_kAZtBxr1gc_6GNcu8LJsjil76knLU7e","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san24","name":"【热议】抖音百因必有果你的报应就是我是什么歌韩美娟经典语录是...","value":"2019年10月22日 - 音百因必有果你的报应就是我是什么歌曲名字,韩美娟经典语录汇总韩美娟为什么变性是变性人吗?韩美娟韩佩泉是一个人吗?韩美娟心酸故事唇腭裂怎么治好的,...","origin":"baidu.com","time":"2019年10月22日 - ","year":"2019","url":"http://www.baidu.com/link?url=D__Y3gCEVt1JOpBS9fh3gKa7dowJ1rtCWEs59n53MwlyHeAIWAhkM76LZbtKzuEF4JMkLlOQRuKbBl4cp-7pnq","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟","韩美娟","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san25","name":"抖音韩美娟:百因必有果你的报应就是我_武汉中秘网络传媒有限公司","value":"1天前 - “抖音韩美娟:百因必有果你的报应就是我”由一巴巴分类信息网产品频道自行发布,该信息由企业(武汉中秘网络传媒有限公司)自行提供,该企业负责信息内容...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=XCoKPZmXN5CH7CSfR8Q2pQmwMa2YP0_xIyPFsbSgTAmhZkv3b4KnkZrfneE9FAX94jn7_gXZEPvWqQdJW6VqsUoroRkvJpfZxqAMEW1IUpi","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san26","name":"百因必有果你的报应就是我 出处韩美娟个人资料_娱乐资讯_艾美丽","value":"2019年9月6日 - 百因必有果你的报应就是我,最近这句话简直成了网络热词,时常在评论区以及弹幕上出现,百因必有果究竟是什么梗呢?百因必有果的出处在哪里?下面就...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=ibvuBJ2Wzl6Xy90bbPW8IRGJxg7c4Ij515jvT1V2B-pceUyUiVlsZEFiYHt67Was","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san27","name":"【韩美娟背诗】百因必有果,你的报应就是我_哔哩哔哩 (゜-゜)つロ ...","value":"2019年9月7日 - 【韩美娟背诗】百因必有果,你的报应就是我鬼畜鬼畜调教2019-09-07 18:15:04 --播放 · --弹幕未经作者授权,禁止转载-- -- -- -- 稿件投诉 视频来源:...","origin":"baidu.com","time":"2019年9月7日 - ","year":"2019","url":"http://www.baidu.com/link?url=8JVuOxG1-ThbwaafQlFHWEJZOrxc3yR0WAmn-EmXKOF6Rb1BlpizLJlXJUn3MJsIcQVnj1GHeB8oip6ytWWcXa","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san28","name":"[韩美娟]百因必有果,你的报应就是我_日常_生活_哔哩哔哩","value":"2019年9月13日 - 1415 0 0:12 百因必有果,你的报应就是我--韩美娟 App 内打开 21.0万 110 0:46 【韩美娟】最终洗脑么么哒~ App 内打开 571.6万 7963 0:21 窝窝头一...","origin":"baidu.com","time":"2019年9月13日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJj7yIQ_9A0zo3lb4NABa22_","keyWords":["韩美娟","百因必有果","你的报应就是我","百因必有果","你的报应就是我","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san29","name":"百因必有果你的报应就是我(韩美娟表情包)_百因_有果_韩美_报应表情","value":"2019年9月11日 - 百因必有果你的报应就是我(韩美娟表情包)_百因_有果_韩美_报应表情长按保存;左右滑动图片,查看更多 关注公众号fabiaoqing,让你站在斗图巅峰...","origin":"baidu.com","time":"2019年9月11日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8zWE5epzov3Jk7LtVUL7clwXgO2NW_UWKUf6Jd_bBWg69uLbnqpI1sYD3e3RocBiCIPSUx78u7GdcZ6xTB5_yi","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san30","name":"抖音韩美娟资料、哪里人 你的报应就是我什么梗 - 淑女志","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫韩美娟的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句百因必有果,你的报应就是我,就是从...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=QoDiTBLwtEcSUFVU7TSIkM5Wejk_xgz_eUppWwcdFB12bC4KA8FWEf2DGWpBXKejDEYAoaUO94vA26xJiDOhPK","keyWords":["韩美娟","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我","就是"],"type":"san"},{"category":4,"id":"san31","name":"抖音韩美娟表情图片下载-韩美娟表情包(你的报应就是我)下载无水印...","value":"2019年9月8日 - 百因必有果下一句就是:你的报应就是我。这句话来自于抖音上的网红韩美娟。别看韩美娟化了化妆很油腻的样子,韩美娟表情包,但其实他是一个男的,而且长的还是很...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=NsfiOcMUlRWdxAsOsZW6sBfDyGd4uUt5mUCvqwFJvJUpzAVe0Y_7DvsWDH30Do3AZX6tXFGrD3zKDF2uWtUJNK","keyWords":["韩美娟","韩美娟","你的报应就是我","百因必有果","你的报应就是我","韩美娟","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san32","name":"韩美娟百因必有果你的报应就是我表情包高清图片完整版下载-72游戏网","value":"2019年9月5日 - 韩美娟最近在抖音上火了,这个大妈真的很逗啊,妆容很夸张的她最近在抖音上拍的...百因必有果下一句就是:你的报应就是我。这句话来自于抖音上的网红韩美...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=gJkodOb7N2xzQqGuT3Qbfvx0vMgtn4ifbuf_BnImlQTEdUJ72bzNX9X4fqPHoU7r","keyWords":["韩美娟百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美"],"type":"san"},{"category":4,"id":"san33","name":"降低含偶量 姚弛直播贡献第二竟然是韩美娟?","value":"热知识:韩美娟是百因必有果 你的报应就是我的原创者 回应 赞 删除 来自豆瓣App 请不要叽叽咕咕 2019-10-31 00:17:17 ?? 回应 赞 删除 来自豆瓣App ...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=aIIcGtUCgIJKkV5pc6kaCiCUyzfaWpOsCeFrnETM7oOXGyMC2fvSd_Z501eFuhcMHZUz9tTUQ7lqHmk9-U1Fuq","keyWords":["韩美娟","韩美娟","百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san34","name":"寄个烧鸡么么哒是什么梗和意思 出自百因必有果韩美娟之口--理财-...","value":"2天前 - 而其中最让“韩美娟”在抖音中爆火的就是那句“百因必有果,你的报应就是我”以及“记得双击么么哒”,相信许多朋友们第一次看“韩美娟”的视频的...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=Deg7E5xrDPICsiA_XFGlPiS-2AOnsSekrTOwr4xnQ1ZqhLTzsCmY-TMPIlYXVcVhbz14C-8I27bS7CZrlVfefq","keyWords":["百因必有果韩美娟","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san35","name":"校园男神整容8次成baby?终于红了……_今日热点","value":"2019年10月18日 - \"百因必有果,你的报应就是我。\"\"记得双击么么哒~\"如果你经常刷某音,你会发现自己根本无法用正常语气将这两句话读出来。这句魔性语出自网红韩美娟。","origin":"baidu.com","time":"2019年10月18日 - ","year":"2019","url":"http://www.baidu.com/link?url=pF-qpe8rDwoxMXAhVCGeLnb41xDm8nTamdtlxmofOp8SvMHlj-KmhVjQaw6dO8Uql-PceQAmAEf1n7MyRD57IFHgKXB36NxqDYdVmiLL7__","keyWords":["百因必有果","你的报应就是我","果你","韩美娟"],"type":"san"},{"category":4,"id":"san36","name":"韩美娟男装照片曝光,颜值逆天,网友:百因必有果你的报应就是我","value":"2019年9月13日 - 最近一个打扮的非常“奇葩”的网红叫韩美娟,用一口独特的京味普通话说出了“百因必有果,你的报应就是我”走红网络,让他很快就受到粉丝的关注,几乎只要是看短...","origin":"baidu.com","time":"2019年9月13日 - ","year":"2019","url":"http://www.baidu.com/link?url=wKy0tZJSS3nY30bxn1QW7cm44vNhe4tnj3r3Mvv0UVxMwUg2_y5iUwVvMJNtCjyhngHdKcmurnIHReE5Vucm0q","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san37","name":"百因必有果,你的报应就是我(马桶里的版本)@韩美娟-原创-高清正版...","value":"2019年10月18日 - 百因必有果,你的报应就是我(马桶里的版本)@韩美娟 发布时间: 2019-10-18 分享 下载 收藏 举报 更多 公司介绍 | 新闻动态 | 联系方式 |...","origin":"baidu.com","time":"2019年10月18日 - ","year":"2019","url":"http://www.baidu.com/link?url=mezYtIhQXxuJmVj_-WzAwOx07Sq3apbzDvz-0UDs1dQTh_uhcnr5CPkxOzIrKmoj","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san38","name":"百因必有果你的报应就是我,记住了吗?臭弟弟 #韩美娟-原创-高清正...","value":"2019年10月6日 - 百因必有果你的报应就是我,记住了吗?臭弟弟 #韩美娟 百因必有果你的报应就是我,记住了吗?臭弟弟 #韩美娟 发布时间: 2019-10-06 分享 下载 收藏 举...","origin":"baidu.com","time":"2019年10月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=mdTMDuyAZVBJNnN9k1GCn4UJ2EVOF5SHpC6u1vv-s5k-0cwRYzUIt-OsLyIj-pKp","keyWords":["百因必有果你的报应就是我","韩美娟","韩美娟 百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san39","name":"留学生妮妹被韩美娟洗脑,“百因必有果,你的报应就是我”说来就...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san40","name":"留学生妮妹被韩美娟洗脑,“百因必有果,你的报应就是我”说来就...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san41","name":"抖音韩美娟gif表情包大全 百因必有果你的报应就是我 - 【可爱点】","value":"2019年9月10日 - 抖音韩美娟你肯定听过吧,他最近是很火爆的网络红人。特别是他的那句百因必有果你的报应就是我。抖音网红韩美娟其实是个男人,但是他的各种模仿秀,现在...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=mwuXsIyVetQJyJ7Yy77yXCJ0P_QUkpsM30JJ5hE93uAFKznEaxBcsU1l6F48GfFJS2gPi3_Q6-qdC0XMOkyFBa","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san42","name":"韩美娟男装照片曝光,颜值逆天,网友:百因必有果你的报应就是我","value":"2019年9月13日 - 最近一个打扮的非常“奇葩”的网红叫韩美娟,用一口独特的京味普通话说出了“百因必有果,你的报应就是我”走红网络,让他很快就受到粉丝的关注,几乎只要...","origin":"baidu.com","time":"2019年9月13日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuEvQhlo3YdqSfPQUNBdBwDV7LK_PLcKnrG3TWrL3vex5LVLzaXijKCiJVL_FiAhpN9q","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san43","name":"左边一个百因必有果,右边一个你的报应就是我,韩美娟你赢了","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟你"],"type":"san"},{"category":4,"id":"san44","name":"假如你的朋友中了韩美娟的毒,百因必有果,你的报应就是我_好看视频","value":"2019年9月6日 - 假如你的朋友中了韩美娟的毒,百因必有果,你的报应就是我,本视频由独树一剧提供,0次播放,有0人点赞,0人对此视频发表评论,好看视频是由百度团队打造的集...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=aj4jcpiqzrjKRddG1-e9kc0ajGj_GQdobMNnTd9L5xLE0fvF7mzbPLXLY_vXdBV5PIbGL5AEIAprSO8uigKZBGncImU2QN3lbGYnwxvBSkS","keyWords":["你的","韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san45","name":"百因必有果,你的报应就是我韩美娟 百因必有果 看见我正在走向你了...","value":"2019年9月14日 - 百因必有果,你的报应就是我韩美娟 百因必有果 看见我正在走向你了吗? 2019-09-14 00:00 百因必有果,你的报应就是我韩美娟 百因必有果 看见我正在走向你...","origin":"baidu.com","time":"2019年9月14日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV6ANCZdEelHaLI_-UDDlbn5wgT9zWe7zLML47Cf4GGbmdq","keyWords":["百因必有果","你的报应就是我韩美娟 百因必有果","你的报应就是我韩美娟 百因必有果","你的报应就是我韩美娟 百因必有果"],"type":"san"},{"category":4,"id":"san46","name":"昨天被韩美娟的“百因必有果,你的报应就是我。”疯狂洗脑!!!回想...","value":"2019年9月6日 - 昨天被韩美娟的“百因必有果,你的报应就是我。”疯狂洗脑!!!回想上次被网红洗脑还是陆超 麻烦叔叔 人气楷模 12 喝酒 与枫相伴4 小吧主 17 有有 ...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=l_nxQ2aqa8yHf79k2NDy0SWC4Qq5QH6JwdI7Jx4f-FOB1vT4GVid-zeLBnmp4AuL","keyWords":["韩美娟的","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san47","name":"小伙被韩美娟支配的恐惧,百因必有果,你的报应就是我,记得双击","value":"2019年9月14日 - 小伙被韩美娟支配的恐惧,百因必有果,你的报应就是我,记得双击是搞笑类高清视频,于2019-09-14上映,视频画面清晰,播放流畅,内容质量高。视频主要内容:...","origin":"baidu.com","time":"2019年9月14日 - ","year":"2019","url":"http://www.baidu.com/link?url=pN7mZeP-jkbsiusSitd7wXVbx53gUBqzo4SdDe5uWEM9UQlFXr5mBmCloVk_wiI8","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san48","name":"抖音韩美娟gif表情包大全 百因必有果你的报应就是我 - 【可爱点】","value":"2019年9月10日 - 抖音韩美娟你肯定听过吧,他最近是很火爆的网络红人。特别是他的那句百因必有果你的报应就是我。抖音网红韩美娟其实是个男人,但是他的各种模仿秀,现在...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=OUYu1w9NTPhsAXcpaJS8cYzJhU1MOY3unX8A2bLs6kjlx6uLlEj84gy_0UCzV6zgQtcIU2BtiSCtuw2RNjl1TK","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san49","name":"百因必有果,你的报应就是我!你们要的韩美娟 仿妆 来啦!百因必有果","value":"2019年9月10日 - 原标题:百因必有果,你的报应就是我!你们要的韩美娟 仿妆 来啦!百因必有果...巅峰大姚有多恐怖,奥尼尔,乔丹给出答案 我叫筱枫 · 昨天22:16 cba版林疯...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=Oqyrn4JVr_RkMeoJ8KNuotb8HHE_cP6FCpWbRkrPVfJ2IjKfJiV5bBQ4QEEZQ8cWXlWeQ5lLcixW4kNqJXIuIq","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","百因必有果","你的报应就是我","韩美娟","百因必有果"],"type":"san"},{"category":4,"id":"san50","name":"当韩美娟踏入你的生活 ,百因必有果,你的报应就是我-动漫-高清完整...","value":"2019年10月17日 - 《当韩美娟踏入你的生活 ,百因必有果,你的报应就是我》动漫电影是由类动漫,于2019-10-17上映。此动漫影片剧情简介:。","origin":"baidu.com","time":"2019年10月17日 - ","year":"2019","url":"http://www.baidu.com/link?url=VxQNh7YiFLewgsM4rb3e9wpJvA_dme90yCJn7syAQxdLnYEB15hi_0BdZBkcrIBe","keyWords":["韩美娟","你的","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san51","name":"百因必有果,你的报应就是我...洗脑的一夜爆红背后竟是...","value":"最近不管是看啥小视频,总会被一个人刷屏,他就是韩美娟。韩美娟因为那句“百因必有果,你的报应就是我”而走红。 妖艳浓厚的妆容,搭配极其怪诞的夸张嗓音,让他不...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=2YxTlJr7ClwgWOngrBY7N9BoHp4D2Uwwelp1H4VYz9H4URRNC3dnBPTp2sDcLelwtAP-xhwAddGEbYTGtDzySK","keyWords":["百因必有果","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san52","name":"小伙被韩美娟支配的恐惧,百因必有果,你的报应就是我,记得双击","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟的"],"type":"san"},{"category":4,"id":"san53","name":"大家都是如何被韩美娟攻陷中毒的!!百因必有果,你的报应就是我","value":"2019年10月17日 - 《大家都是如何被韩美娟攻陷中毒的!!百因必有果,你的报应就是我》动漫电影是由类动漫,于2019-10-17上映。此动漫影片剧情简介:。","origin":"baidu.com","time":"2019年10月17日 - ","year":"2019","url":"http://www.baidu.com/link?url=9lpZ8UdiUN59qCTGtDVh-09pI_lyt-teuo6wvi3mpalgm0ssb5ZtqHRm3M9vuZgo","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san54","name":"韩美娟gif表情包_抖音韩美娟百因必有果你的报应就是我图片下载_...","value":"2019年9月6日 - 韩美娟gif表情包,最近被韩美娟疯狂洗脑,百因必有果,你的报应就是我,不服现实碰一碰,看我扎不扎你,不要在网上bb赖赖的,很多人想要这个表情包,下面就和...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=JodrhXwEAH8CnGwAi4hfhUWoFlphWvtfIsl_f_ei0XuJMHTSNGzdxUdNxhD29-C-kkBuFlwp4jI-JrtwpJvMaq","keyWords":["韩美娟","韩美娟百因必有果你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san55","name":"“百因必有果,你的报应就是我”韩美娟有多魔性?听一遍就忘不掉","value":"2019年9月4日 - 而且不光如此,抖音每隔一段时间就会出现一个梗,相信喜欢玩抖音的网友都知道,最近打开抖音都被一句“百因必有果,你的报应就是我”给刷屏了,很多人都画...","origin":"baidu.com","time":"2019年9月4日 - ","year":"2019","url":"http://www.baidu.com/link?url=y1GLdFWTW9hL6nvKGfMJN3HmZHUp85tOFfuxtpic0XnnscA-IGJ9IOQ8QHyDoRHJn81BvpVBZLirBDHhYPzVx_","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san56","name":"听过“百因必有果,你的报应就是我”吗?韩美娟卸妆后掉粉无数","value":"2019年9月10日 - 随着短视频软件的流行,现在很多网红都是通过在网上发布视频火起来的,而最近有一位名叫韩美娟的网红大火起来,他的经典名句“百因必有果,你的报应就是我...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=BK4onE7790XWhuA-Y73i_YL5XkcEAuB0IPTr0_JOKTmrFD6yrH8Kc_Byaidu8gI2WzgRrAve0qM17S-dPuXE-gdBQ7c9JG1KbZO7pQho-0_","keyWords":["百因必有果","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san57","name":"抖音韩美娟:百因必有果,你的报应就是我_新闻_河北热线","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=RGOAGIu1eCkQk4FLRJpEz_87mLQDM_4H5QFpUCJHXmR4vuMlpp3ozntrthq-NXaxAVYkAxPBEAq4wPWoYUM7fwGpSvrHP35oqIqa0nM9J2_","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san58","name":"短视频上那些大火的网红,之百因必有果,你的报应就是韩美娟!","value":"2019年9月24日 - 短视频上那些大火的网红,之百因必有果,你的报应就是韩美娟!简介 热度55 评论 极清 缓存 分享为你推荐 超级网红韩美娟:“百因必有果,你的报应就是我”0...","origin":"baidu.com","time":"2019年9月24日 - ","year":"2019","url":"http://www.baidu.com/link?url=gR61dLEseHOwu9isT0mJWzTRrQRlA4PbOO2-Hf5ZgvYA5-hbH68Z48R24BXg13MNBQPfFW0Nd44AXvDQEWiMHK","keyWords":["百因必有果","你的报应就是韩美娟","百因必有果","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san59","name":"抖音韩美娟:百因必有果,你的报应就是我_濮阳文化网-濮阳网络聚焦...","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,不服现...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=aU5DpZx5C5LFTX0yPUfgh-FD1IyHCftucsCs6S7stBN9Lz4FBzYBmNP5yC8_WagnfpJhPL3Lpztq-BIG_PUR8a","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san60","name":"百因必有果,你的报应就是我,揭秘韩美娟笑容背后的故事","value":"2019年9月10日 - 大家最近是不是都被这句“百因必有果,你的报应就是我”给洗脑了呢?不要说你们不是,反正我是不会相信的。韩美娟这种另类的搞笑方式下,其实隐藏着的是当...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuEvQhlo3YdqSfPQUNBdBwDV7LK_PLcKnrG3TWrL3vex5L6MBhxcA77aIT50wpmiihMK","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san61","name":"抖音韩美娟gif表情包大全 韩美娟百因必有果你的报应就是我","value":"2019年9月19日 - 导读:抖音韩美娟你肯定听过吧,他最近是很火爆的网络红人。特别是他的那句百因必有果你的报应就是我。今天分享一组韩美娟gif表情包。...","origin":"baidu.com","time":"2019年9月19日 - ","year":"2019","url":"http://www.baidu.com/link?url=ThybfX02guGfwEGjNCxCqxdt7EkxtxGwdkAoq2h1bI350hZK3x6mrv1lSowqAi-jybyJJSznFesdcMNGbyqG_K","keyWords":["韩美娟","韩美娟百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san62","name":"表情包更新百因必有果,你的报应就是我你们好 我是韩美娟#表情","value":"2019年9月15日 - 表情包更新百因必有果,你的报应就是我你们好 我是韩美娟#表情 只看楼主收藏回复 欢心 打酱油的 5 表情包更新百因必有果,你的报应就是我你们好 我是...","origin":"baidu.com","time":"2019年9月15日 - ","year":"2019","url":"http://www.baidu.com/link?url=89z8siGAIVqDHrjwb9SiqG7v267VyXGX7q5Tp3sp4VGudpRxWHQqkXmDoDKDkKGA","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san63","name":"百因必有果你的报应就是我真实含义来了!原出处作者韩美娟是男的!","value":"2019年9月10日 - 现在抖音火了老多梗了,最近比较流行的就是百因必有果,你的报应就是我。咱们今天从语文和逻辑的角度来分析这句话是什么意思。 OK,解释之前,先让咱们来...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=dG930Wgj8gRWERgRMXzzoKvj36ZnZ9JLJ-WzI7zReOK1UxyZcatzSIEtsyk3K7qS","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san64","name":"新旭唱的百因必有果你的报应就是我里面的英文歌叫什么_百度知道","value":"最佳答案: 百因必有果”的下一句就是“你的报应就是我”。非常通俗顺口的一句话,也非常的好理解,本来的意思就是说万物都是有因有果的,人要是做了不好的事情...\n更多关于韩美娟百因必有果你的报应就是我林自勇就是牛逼的问题>>","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=UJRpJ31TN6yIgJZToMYy4DdmwIhV1pgzofpYEF-ezrUNWiT7Pm-qLFWI60A5URKXmzdswsUZLuPkAMlEMCN1MVHpn5wV_JUkQqvedXcafvC","keyWords":["百因必有果你的报应就是我","百因必有果","你的报应就是我","就是"],"type":"san"},{"category":4,"id":"san65","name":"【热议】抖音百因必有果你的报应就是我是什么歌韩美娟经典语录是...","value":"2019年10月22日 - 音百因必有果你的报应就是我是什么歌曲名字,韩美娟经典语录汇总韩美娟为什么变性是变性人吗?韩美娟韩佩泉是一个人吗?韩美娟心酸故事唇腭裂怎么治好的,...","origin":"baidu.com","time":"2019年10月22日 - ","year":"2019","url":"http://www.baidu.com/link?url=nVHiNMEhT2A11TBghMoy3g64g7sik6-IcV0eNWdSOPiIxHk7kfLnqXrTlFjZTGlSmoREtX-R2UYgg3K_gymxMq","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟","韩美娟","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san66","name":"[抖音]韩美娟 百因必有果你的报应就是我,记得双击么么哒_哔哩...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟 百因必有果你的报应就是我","韩美娟 百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san67","name":"现实版的韩美娟:有因必有果,你的报应就是我_好看视频","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","因必有果","你的报应就是我","韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san68","name":"抖音韩美娟gif表情包大全 韩美娟百因必有果你的报应就是我","value":"2019年9月9日 - 导读:抖音韩美娟你肯定听过吧,他最近是很火爆的网络红人。特别是他的那句百因必有果你的报应就是我。今天分享一组韩美娟gif表情包。...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=AvpdMI5wAOZzM2jmeWrN4FbHMuofQR5r4qZPGVVV6L-Md4kqfNbX25ryDJmKfLgfAXNi4Bj0c-VyvrUXtrKrkK","keyWords":["韩美娟","韩美娟百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san69","name":"朱梓骁模仿韩美娟太辣眼:百应必有果,你的报应就是我-娱乐-高清...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","必有果","你的报应就是我","韩美娟","必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san70","name":"百因必有果,为何韩美娟能在抖音迅速走红?_手机搜狐网","value":"百因必有果,为何韩美娟能在抖音迅速走红? 胖小墩 09-25 22:21 关注 这些...“百因必有果,你的报应就是我” “不要在网上哔哔赖赖,不服现实碰一碰,你...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV6AFC2vx5MDcby7Z1napK2asEDKXQyAUyeGTBBdeHbzeIq","keyWords":["百因必有果","韩美娟","百因必有果","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san71","name":"被上千网友骂“恶心”,这个扮成大妈的00后男孩,让我看到了人性...","value":"2019年10月4日 - “百因必有果,你的报应就是我。”如果你平时冲浪还算多,一定知道这个金句的主人:韩美娟,那个霸占了热搜一整周的网红。 韩美娟搞笑的画风让人一言难尽,...","origin":"baidu.com","time":"2019年10月4日 - ","year":"2019","url":"http://www.baidu.com/link?url=b9jHqFYNidahg_ulQQlhNTn-_N7-KcjwAzPNh2GfaiDoMo0gqDlaUlg_pcrsq9FJQEuCZgpWL54nVnE-lOf0zgeeP4-YyF8zXxB38OcTsF7","keyWords":["百因必有果","你的报应就是我","果你","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san72","name":"“你的报应就是我”,火遍全网的韩美娟,卸妆后不输蔡徐坤-娱乐-...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["你的报应就是我","韩美娟","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san73","name":"韩美娟自称上学时没人追,原本还不信,看到他的旧照:换我也不追!","value":"想必大家对他的那句“百因必有果,你的报应就是我,记得双击么么哒”印象深刻吧!甚至被韩美娟的经典台词所洗脑。 其实,现实中的韩美娟患有先天性的...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=vwLPHl2qJ5IHsqXu5A6UhTuIA9jOcGl6NdpuqYNGCe0M8VnVb23RKBjTWvy5KqflZ0b4fX-p-G0otlUCgIrOCq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san74","name":"落难王子韩美娟:把受伤的自己杀死在13岁_手机搜狐网","value":"首页 时尚 百女3广告 落难王子韩美娟:把受伤的自己杀死在13岁 ...广告 “百因必有果,你的报应就是我!” 展开剩余94% 广告 推荐...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=YYoOLSXJXaBozp1Dc8CnGQfTt0j199ApkGKAxq7OwSs-bJyoZGSTEnNWMMH9S3iJ","keyWords":["韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san75","name":"PGone发声回应,近1500人打赏!呼叫韩美娟扎他!","value":"1天前 - 百因必有果,你的报应就是我。我真的希望,面对这样一个三观不正的人物,以及还在声援PGone的一些黑粉,我真希望韩美娟能够表达一下自己的看法,并且扎一扎他。很多...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=Di0DuapNFYA68UIRDs-3XjlokKg5RUTJkQHa616AkqIda71b_Ak586iJiCcAszFXyfmaurxHNCbM9sNUUrbP8BPyNEG6cgCjjqnlieaYnwC","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san76","name":"【图片】那些语文老师认为狗屁不通的文案,怎么就火了?【阅经吧】_...","value":"19小时前 - 这句话从语文角度来讲,简直狗屁不通,但是架不住韩美娟把她当成口头禅,一遍一遍,不厌其烦地重复,以致形成洗脑的效果。这句“百因必有果,你的报应就是我...","origin":"baidu.com","time":"19小时前 - ","year":"19","url":"http://www.baidu.com/link?url=fN1R6wG7XfFughKzzL758St9WgawyvqqMvQqqqHkizY-6GQZr_1GHaovJRT9MzQP","keyWords":["韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san77","name":"韩美娟和赤木刚宪是情侣?看完后,网友:可能我是最后一个知道的","value":"21小时前 - 百因必有果,你的报应就是我。韩美娟红了,他极具个人风格的视频让人不想记住都难。画着欧美浓妆,但看着像个大妈,可本人却是个00后大男孩! 气质,...","origin":"baidu.com","time":"21小时前 - ","year":"21","url":"http://www.baidu.com/link?url=rUwFvYEoAaQ-FF9plFEojVgZo6FcobV5UA2sN1H1Xu4HLyM3pUuAcWHWi5PMFU_DPqDF-xDW_E07398dIHTdZq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san78","name":"【图片】史上最“恶心”网红,让我看到了人性真实的一面【维扬卧龙...","value":"54分钟前 - 史上最“恶心”网红,..文| Act行动起来出处| 行动派DreamList (ID: xingdongpai77)01抖音爆火网红背后,是19年的艰难人生“百因必有果,你的报应就是我...","origin":"baidu.com","time":"54分钟前 - ","year":"54","url":"http://www.baidu.com/link?url=q5YWIVnA1IyOmIQqZatiqH-ez-iW2Sew7RF6n5Sv5Bf5AJ3ctitNnbZY-wzsNZdA","keyWords":["百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san79","name":"百因必有果——韩美娟凭什么在抖音一夜爆火?-武汉中秘网络传媒...","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=UKcY7FmTX37qI-2JDHstBD0SPyZiwYTuN_BmXCN_0bDAQm5AvHvKoOw9M64TOxGJNwe298TRXhiuJuFi1oK7Na","keyWords":["百因必有果","韩美娟","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san80","name":"百因必有果——韩美娟凭什么在抖音一夜爆火?_武汉中秘网络传媒...","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=OAIGlDHDAMnBr07OLrGegBEGhvJtkteLEhYilkjNNAGq_jt589bplKNXHfACY81a1EAso9SXUjBu_6QyG7_DTn-AAMBDXkftagDDZ1QR-_a","keyWords":["百因必有果","韩美娟","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san81","name":"学会了韩美娟,你就是下一个抖音网红!-武汉中秘网络传媒有限公司(t)","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=SApoXznq7mtKT_9T-ZKCUTtBA5gaHNVL1rI6Q3Z7x3Xqt2oJvsNJ2YJgt7K7ftbE46e2js3HzpYNeodVuuQdZ_","keyWords":["韩美娟","你就是","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san82","name":"“抖音一姐”韩美娟,你凭什么一月涨粉700万?-武汉中秘网络传媒...","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=vP6XX_UmPJ8vtpMcMVUPa2k9L4Ex3AZ5VkJMkKk0CeobmsdldynTfOLgrm1PWQqGLYzSm71EdIWvwDr_BhnkiK","keyWords":["韩美娟","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san83","name":"学会了韩美娟你就是下一个抖音网红!_武汉中秘网络传媒有限公司","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=K-6iZzTlHhpU1AbVtWwCM5jYaXr6gUvEMBuf4H2BiEJT3sq3kZ2bxZMhbWQmFxtd3J4yqdy6THY_TwQPxO26g-ZS3S6I1AaJ64iysfrWXFu","keyWords":["韩美娟你就是","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san84","name":"“抖音一姐”韩美娟你凭什么一月涨粉700万?_武汉中秘网络传媒有限...","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=PYTAqSWi1f1-xjouwrR8P9jqdpjyMC5l57cF0LyxQzXPwHmQyrkBsxgjo3BkTFTMLSkCjWfmH_cq16TqQ8Pn8ubWQDt0Hws5Ho65TFm4uKe","keyWords":["韩美娟你","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san85","name":"韩美娟百因必有果你的报应就是我表情包","value":"2天前 - 抖音网红韩美娟其实是个男人,但是他的各种模仿秀,现在被很多人点赞,不少人都觉得有意思。下面,一组韩美观的动态表情包送给大家。 免责声明:本文来...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=Sn2FDAiE4qo-DZaA-1XQtPTsreQEshIdKNlM9ocaMBYrEB1qpIxU9lLnYisRXYkcTtlCVccF8onX-DmnI6swz_","keyWords":["韩美娟百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san86","name":"百因必有果你的报应就是我表情包高清无水印下载(抖音韩美娟表情包...","value":"2019年9月6日 - 百因必有果你的报应就是我表情包是当下火爆抖音一款表情包,抖音韩美娟是当下非常火的一个短视频网红,许多人都被他的段子吸引,小编今天为大家整合了百因必有果...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=iBoPU0MgS5PjHGVjfTTSTeSLM1DxhWTC2kdd22OjhQyCilHG3q9Z_CiWBY5mFTUT","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san87","name":"百因必有果你的报应就是我表情包下载-韩美娟表情包(zip)高清版 - ...","value":"2019年9月5日 - 百因必有果你的报应就是我表情包这款表情包最近是已经火遍了抖音,相信很多的小伙伴已经被这款表情包给洗脑成功率,所以小编给你们大家单来的这款百因必...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=bbU35n9H3_1hQjUufbMlnqXlKSUL8YOGxvH16ePxMdau5Pa5pBmhkcqTM59W0tTZ0cp9dyH7CAREAUUGnyh5ea","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san88","name":"抖音百因必有果你的报应就是我是什么意思_来源出处是哪里","value":"2019年9月3日 - 最近抖音里出现了一个红人叫韩美娟,她在抖音里说“百因必有果,你的报应就是我”,很多人都表示怕了怕了,下面小编就为大家介绍一下百因必有果的意思吧。","origin":"baidu.com","time":"2019年9月3日 - ","year":"2019","url":"http://www.baidu.com/link?url=fJ5P3mDdJxPJPBMMaMXI6q-V-CC2E7HjHC0NoFruwQ3EXKcQ8xxGTNR4kCEVlfMu7GTiJtC4G6hH8e0UPMFOZ_","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我","百因必有果"],"type":"san"},{"category":4,"id":"san89","name":"抖音百因必有果你的报应就是我无水印表情包_娱乐文章_新趣手机站","value":"2019年9月5日 - 说到这个抖音的韩美娟,想必大家应该都有在抖音上面刷到他或者说刷到用他声音的视频吧?这几天小编真的是被这个“百因必有果,你的报应就是我,记得...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=j5ZFk9nQGWl3lxvJORBRbgAer-bbkHyWMb-OxiQjLcn3gjbcucq7arRUdz_oZKWk","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san90","name":"...作者:梁嘉烈 “百因必有果,你的报应就是我。” 这是抖音..._雪球","value":"2019年9月12日 - 本文首发微信号:镜像娱乐(ID:jingxiangyule) 作者:梁嘉烈 “百因必有果,你的报应就是我。” 这是抖音博主韩美娟的经典语录。38部作品,747.5万粉丝,394...","origin":"baidu.com","time":"2019年9月12日 - ","year":"2019","url":"http://www.baidu.com/link?url=YYoOLSXJXaBozp1Dc8CnGPtekWmxyVe56kRRWAYSIqkFRh544ZgLYkLkHKrJRlus","keyWords":["百因必有果","你的报应就是我","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san91","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿--豪仕阅读网","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=ws6cxNIhWmVA1gbrUgFMRsecfzEFFq6HC5Inw1_-GY9IBdBCt6Q3XePXjQZPvWZ77hxwWZfNNMGpvU8j6gUtr_","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san92","name":"“有因必有果,你的报应就是我”韩美娟的崛起,为什么火了整条街_...","value":"2019年9月8日 - 最近某短视频平台彻底被一个叫韩美娟的“女人”给沦陷了,据说十条视频九条都是他的,他的一句“有因必有果,你的报应就是我,记得双击么么哒”成为了大众争相...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=dizRBcmQwLLpivHFRDhBINiIA58oqN1PoZdnNgXLWcpeoBnjeBohORGV0VVRpcGmBR43vlvgibtSUyNidjRcWK","keyWords":["因必有果","你的报应就是我","韩美娟","韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san93","name":"你的报应就是我是什么梗 百因必有果你的报应就是我出自哪里 _八宝网","value":"2019年9月7日 - 这句话是出自一个抖音账号为韩美娟的录的短视频,因为非常夸张的化妆技术,以及搭配魔性的语调讲出“百因必有果你的报应就是我”,瞬间在网络上爆红,...","origin":"baidu.com","time":"2019年9月7日 - ","year":"2019","url":"http://www.baidu.com/link?url=98a7m_hHXhbYHCGEtVXKChKEvJsdMdJo5X5oQkVHN8YrWFykTeUIUUN6PMlDXVSh","keyWords":["你的报应就是我","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san94","name":"『韩美娟』百因必有果,你的报应就是我,记得双击么么哒!_其他_生活...","value":"2019年9月14日 - (韩美娟)可不可以给我你的微信,记得双击么么哒!!! App 内打开 38 0 0:15 百因必有果你的报应就是我记得双击么么哒 App 内打开 6.0万 84 2:51 [法克...","origin":"baidu.com","time":"2019年9月14日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJmfgT0qbo7Hhf1dtccFlI6_","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san95","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 趣事 - ...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=sJbHmYTXzeI1Dsah6MRlUIVSElhIlD-kNy6oVKqbBfy3vKMRZFyH6C3ZRLoRrlTR9zooYLNN_7DNKAowSQbn3a","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san96","name":"留学生室友行为大赏:百因必有果,你的报应就_今日焦点新闻","value":"4天前 - 以下10个投稿真心应了我们韩美娟老师的话 —— 百因必有果,你的报应就是我(手动捂脸)... 1.你兜里的钱好像跟我的长得一模一样 有一天在上课前,我疯狂...","origin":"baidu.com","time":"4天前 - ","year":"4","url":"http://www.baidu.com/link?url=CvLmEq19AIrL8tgUXf2rScbyjGEhMtPKf6clAVqJ5SfWUa7QumjUCq-_S0Tp44pQGd5YEI_Wm9G4Fc2InIzUuK","keyWords":["百因必有果","你的报应就","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san97","name":"抖音韩美娟表情包大全下载|抖音韩美娟你的报应就是我表情包下载v1...","value":"2019年9月9日 - 本站为您提供抖音韩美娟你的报应就是我表情包,抖音韩美娟你的报应就是我表情包由“百因必有果你的报应就是我”这句话衍生而来,趣味搞怪表情图片不止在抖音上...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=pL8rkd3gLA5Jv_BBUg1ujmJUF4YlMea3RIIPqHUTN_Q1yJqEP_cwfJiR9fVsJYsS","keyWords":["韩美娟","韩美娟你的报应就是我","韩美娟","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san98","name":"王菲“韩美娟”将合作?网友:百因必有果,你的“报应”竟是他?!!","value":"王菲“韩美娟”将合作?网友:百因必有果,你的“报应”竟是他?!!何向凡凡 10-25 14:45 投诉 阅读数:160 转发 评论 1 快速开通微博你可以查看更多内容,...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=VhSJfUKbr9hudtNgjn0stRp1Yh6vWZ0FUQ2_Ou3NxCrWA9_P_H_X1ONLjX0n8yu9dh68KjcfW042TnnNXFr4MuJgfIeG-xEfADANMbbttf_","keyWords":["韩美娟","百因必有果","你的","报应","韩美娟","百因必有果","你的","报应"],"type":"san"},{"category":4,"id":"san99","name":"...是我表情包_抖音韩美娟百因必有果你的报应就是我图片下载_游戏吧","value":"2019年9月6日 - 百因必有果你的报应就是我表情包,最近被韩美娟疯狂洗脑,百因必有果,你的报应就是我,很多人想要这个表情包,下面就和游戏吧小编一起来看看这个百因...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=EtRTjEsyp6XDaIXXlnv7sUWIH5r14lroW-PN9AS_Wu5z7M8sUaRcFctEx2bICNtRFNqQSMHdGYBNIfNtWUvauq","keyWords":["是我","韩美娟百因必有果你的报应就是我","百因必有果你的报应就是我","韩美娟","就是"],"type":"san"},{"category":4,"id":"san100","name":"你的报应就是我表情包下载-韩美娟你的报应就是我表情包高清下载v1...","value":"2019年9月5日 - 百因必有果下一句就是:你的报应就是我。这句话来自于抖音上的网红韩美娟。 别看韩美娟化了化妆很油腻的样子,但其实他是一个男的,而且长的还是很...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=IoG_2C8rmgKMN_2nB62Hqr2LBREP37AtaTxSDiD8VBvB1DDkiDYDwfgRPVHO6V9P","keyWords":["你的报应就是我","韩美娟你的报应就是我","百因必有果","你的报应就是我","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san101","name":"韩美娟动态表情包_韩美娟你的报应就是我动态文字表情包-安软市场","value":"2019年9月8日 - 韩美娟你的报应就是我动态表情包。最近抖音上的“韩美娟”火的不要不要的,简直是一大神奇,今天小编整理了一组很有意思的韩美娟你的报应就是我动态...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=fCcmhQVumcbcepk-OM6F2WllK3d20UUztspSjRKjxdPD6otRXzQQ8p-QvzfBfHHC","keyWords":["韩美娟","韩美娟你的报应就是我","韩美娟你的报应就是我","韩美娟","韩美娟你的报应就是我"],"type":"san"},{"category":4,"id":"san102","name":"网红韩美娟表情包下载|抖音韩美娟你的报应就是我表情包图片下载无...","value":"2019年9月9日 - 百因必有果下一句就是:你的报应就是我。这句话来自于抖音上的网红韩美娟。别看韩美娟化了化妆很油腻的样子,韩美娟表情包,但其实他是一个男的,而且长的还是很...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=MsmxuqKbJuiFUNANySWmGMe4-NhBW6tpKPNqNg80EmEfeU2MuY2iDppr6f28zHTK","keyWords":["韩美娟","韩美娟你的报应就是我","百因必有果","你的报应就是我","韩美娟","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san103","name":"赵小涣 - 你的报应就是我‘(韩美娟)收藏会员列表","value":"收藏了“赵小涣 - 你的报应就是我‘(韩美娟)”的会员列表专辑用户:往事。专辑名称:我的收藏时间:2019-10-16 12:34:11 专辑用户:郑晓晓专辑名称:我的收藏时间...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=-USc_XxEdLKCgRsycpLRbepY--X_SS-59QJBWWl-aHyy9Dut0ij0PBCopofSDVG9DxGvOSw53S4IfTcIBBZXVK","keyWords":["你的报应就是我","韩美娟","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san104","name":"你的报应就是我图片下载|抖音韩美娟你的报应就是我表情包 ..._绿盟","value":"2019年9月10日 - + 展开全部抖音韩美娟你的报应就是我表情包 免费版介绍 抖音韩美娟你的报应就是我表情包,是一款最新推出比较热门的微信QQ表情包。是最近比较热门的韩...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=3Mwk0H8BnVOv6hH6PEATaneO6IBZV-KrRy65K1rG2n9wb75K-Rc8ITW-IBY4TM_T","keyWords":["你的报应就是我","韩美娟你的报应就是我","韩美娟你的报应就是我","韩美娟你的报应就是我","韩"],"type":"san"},{"category":4,"id":"san105","name":"抖音韩美娟你的报应就是我qq表情包(抖音韩美娟你的报应..._绿色先锋","value":"2019年9月10日 - 抖音韩美娟你的报应就是我qq表情包是一款最近在抖音上非常火热的韩美娟搞笑表情包。最近非常火热的韩美娟你知道吗?抖音韩美娟你的报应就是我qq表情包来源于“你的...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=SkOFAV9AXgOt5odZ-IfvHAN_5ZJ57PXXh2QytnnsdBIqlwgLcWPYAU2k9_Dh_H96TGbWRd-yZuSep7wv3pzepa","keyWords":["韩美娟你的报应就是我","韩美娟","韩美娟你的报应就是我","韩美娟","韩美娟","韩美娟你的报应就是我"],"type":"san"},{"category":4,"id":"san106","name":"Siri中了韩美娟的毒,百因必有果,你的报应就是我!_腾讯视频","value":"2019年9月7日 - Siri中了韩美娟的毒,百因必有果,你的报应就是我! 去下载 下载需先安装客户端 {clientText} 客户端特权: 3倍流畅播放 免费蓝光 极速下载 手机...","origin":"baidu.com","time":"2019年9月7日 - ","year":"2019","url":"http://www.baidu.com/link?url=dBd8j3CrNKOYfpTxDfqWUoI5_K8swvg-76RAm9EJR9nSGed0-lKGLwhNSQ4n0bPyZP7Ofx_p6d0eB7B1V-Yshq","keyWords":["韩美娟的","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san107","name":"【韩美娟】野狼disco 百因必有果 你的报应就是我_哔哩哔哩 (゜-゜...","value":"百因必有果 你的报应就是我记得三连 么么哒midi:小学生是我师父素材:抖音 韩美娟bgm:野狼disco其他:为何独恋me梦琪","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=F-CgaAoLUft0C6yq-SHyuO9jXZo2RSdww5iWJHqLkK3xkOP5v30RKL-91zKBMZzbC9dUi-aSwvu6JoQgzcXUSa","keyWords":["韩美娟","百因必有果 你的报应就是我","百因必有果 你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san108","name":"一个月吸粉1082万,150位抖音达人涨粉超100万,他们的涨粉秘籍是……","value":"7天前 - 榜单第一是凭借一句“百因必有果,你的报应就是我”火遍全网的“韩美娟”,涨粉1082万; 第二名是“惊天碉堡团”,“父子档”上演搞笑日常涨粉596万; 第三是...","origin":"baidu.com","time":"7天前 - ","year":"7","url":"http://www.baidu.com/link?url=ZSrkT81hO8Puvh4GzS5V35TlwZ40KsKWQtYKul1AivVSKw6OB_Zw2PuqmRwBVRwF","keyWords":["百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san109","name":"#韩美娟# 哈哈 百因必有果,你的报应就...-来自相信天上会下鱼的猫...","value":"#韩美娟# 哈哈 百因必有果,你的报应就是我[笑cry] ​ 相信天上会下鱼的猫 +关注 414次播放 09月05日 转发 2 ñ4 评论 o p 同时转发到我的...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=G1xI4UzJX4todmHg3Y4PEIOgOW_DespucDCgkNjiyXiJGtZH-GnHr0-S-niDI0xQYrIIAp4ej7kfyE6AHNkl7Lj_JoAWy3cT8P2aqqe1TCi","keyWords":["韩美娟","百因必有果","你的报应就","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san110","name":"你的报应就是我韩美娟表情包下载-抖音韩美娟表情包全网完整版下载...","value":"2019年9月6日 - 最近在抖音平台的韩美娟非常的火爆,你的报应就是我也是出自网络红人韩美娟,网上各种各样的韩美娟表情包也是非常的多,在这里小编为大家收集整理带来了...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=Lxh_ZAXAHWjDy3ew6Jxo1n93mPpjQcedXtaI8U5YJBNc9yUxMIh1hftxE_YLdbJzBngPoSemECWb-axZSVbXJG4_Qa9OoHSh8UR_23eyAJe","keyWords":["你的报应就是我韩美娟","韩美娟","韩美娟","你的报应就是我","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san111","name":"万恶之源 韩美娟:百因必有果,你的报应就是我!","value":"万恶之源 韩美娟:百因必有果,你的报应就是我!侦探Mr5 喜欢我的视频就关注我!每日更新新鲜趣味视频~ 订阅 侦探Mr5的其它视频 00:01:37 小沈龙搞笑调侃老妈...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=fvGSBq5NeKyy7mgnEN4Mdd2P8HfK03ybzzOxuU0Y17Td54nQWB6_6-Z00FU_uw4oxNJMwqarPjez4RoOZsjeRq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san112","name":"【韩美娟】韩美娟rap单曲,百因必有果,你的报应就是我。_哔哩哔...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","韩美娟","百因必有果","你的报应就是我","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san113","name":"天雷滚滚【韩美娟】横空出世!百因必有果 你的报应就是我!_哔哩哔...","value":"00:10韩美娟 百因必有果,你的报应就是我。英雄小马仔 4168播放 · 0弹幕 00:11百因必有果你的报应就是我丁卯月 164播放 · 1弹幕 00:52听了百因必有果...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=OoExiNOM7l0tRjkZohRvDN0GNB-Wc6i_l7uoZ9TW9_TEPJ311hGUPi1IES9bgd69uLoWLuU9FlQ736DY5imbT_","keyWords":["韩美娟","百因必有果 你的报应就是我","韩美娟 百因必有果","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san114","name":"灵魂仿妆韩美娟!百因必有果 你的报应就是我~寄个烧鸡么么哒~_美妆...","value":"2019年9月19日 - 韩美娟改编《野狼disco》?太魔性了,网友:忘记原唱 App 内打开 67.2万 180 0:13 百因必有果,你的报应就是我,记得么么哒 App 内打开 22.4万 342 33:39...","origin":"baidu.com","time":"2019年9月19日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJqrsxi37Obw-z2EaBOxVqfK","keyWords":["韩美娟","百因必有果 你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san115","name":"百因必有果,你的报应就是我!零零后男生作死挑战韩美娟性感造型…...","value":"2019年9月11日 - 美妆韩美娟百因必有果你的报应就是我么么哒 收藏 缓存 分享 82 评论 55.1万 1737 3:43 韩美娟改编《野狼disco》?太魔性了,网友:忘记原唱 App 内打开 7...","origin":"baidu.com","time":"2019年9月11日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJEw41vaHRKaPPICW2P8dnf_","keyWords":["百因必有果","你的报应就是我","韩美娟","韩美娟百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san116","name":"韩美娟(百因必有果,你的报应就是我,记得双击么么哒,呕……)_搞笑_...","value":"2019年9月1日 - 韩美娟(百因必有果,你的报应就是我...爱国大使川建国2.0万次观看6弹幕9-1 http://v.douyin.com/PHn9kC/ 别的地方看到了我就弄过来了,新手,嘿嘿。 主页...","origin":"baidu.com","time":"2019年9月1日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJzVaDyygu204qyD1jsiJFhq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san117","name":"韩美娟(百因必有果,你的报应就是我,记得双击么么哒,呕……)_哔哩...","value":"2019年9月1日 - 00:35妹子是如何从第一次看韩美娟到第三次看被同化的萌萌那个新哟 4.7万播放 · 33弹幕 01:55望海因必有果,你的报应就是我,嗯,记得双击么么哒。少年阿...","origin":"baidu.com","time":"2019年9月1日 - ","year":"2019","url":"http://www.baidu.com/link?url=PpotwJIhujlOSujlDcgf1BTJOeWBcvHmBIrzNnbFBfkUTrbSgPo4YMIc0yr4o35IgqAEpxTLgl4GU9rIkelVtq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san118","name":"[抖音]韩美娟 百因必有果你的报应就是我,记得双击么么哒_搞笑_...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟 百因必有果你的报应就是我","韩美娟 百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san119","name":"【韩美娟集锦】我最爱的蝴蝶菇凉!百因必有果,你的报应就是我!...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san120","name":"百因必有果你的报应就是我 出处韩美娟个人资料_兰叙网","value":"2019年9月19日 - 百因必有果你的报应就是我,最近这句话简直成了网络热词,时常在评论区以及弹幕上出现,百因必有果究竟是什么梗呢?百因必有果的出处在哪里?下面就...","origin":"baidu.com","time":"2019年9月19日 - ","year":"2019","url":"http://www.baidu.com/link?url=JSJ2u3VyyP9wsHudyLg7Ifb0nKQMhNuynYESQ2hqcvm8Fc7vQ1ATAPZM4MmNwgyePyvMQ9uhapDQXzi3LczEf_","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san121","name":"百因必有果你的报应就是我 出处韩美娟个人资料_娱乐资讯_艾美丽","value":"2019年9月6日 - 百因必有果你的报应就是我,最近这句话简直成了网络热词,时常在评论区以及弹幕上出现,百因必有果究竟是什么梗呢?百因必有果的出处在哪里?下面就...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=jCHnX8pv7ezUvUfilUuclsNVb1BpSQrhAuCCkWcUceU8z_Erw8HJDxzWE9xpHFB6rmcMV9Cc039SXZAesytaea","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san122","name":"👻火遍全网的韩美娟百因必有果,你的报应...-来自哎呦喂老蒙-...","value":"👻火遍全网的韩美娟百因必有果,你的报应就是我! 227与你同在! #韩佩泉[超话]##韩美娟##用百因必有果造句# ​ 哎呦喂老蒙 +关注 2次播放 10月28...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=laV1IKGwwkaKa2mCAzp8h2kEaQXLXXIdFrglg0Sm63CfQCcCfy3G1LUf04lCyabBVeeS14Lg3DHKdQCvO5iJ509g9xelpLp5UxTSqJFhIDW","keyWords":["韩美娟百因必有果","你的报应","韩美娟百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san123","name":"Siri中了韩美娟的毒,百因必有果,你的报应就是我!","value":"Siri中了韩美娟的毒,百因必有果,你的报应就是我!专讲冷笑话 人生就像一个冷笑话,搜罗史上最新最好玩最搞笑的搞笑段子。 订阅 专讲冷笑话的其它视频 ...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=fvGSBq5NeKyy7mgnEN4Mdd2P8HfK03ybzzOxuU0Y17Td54nQWB6_6-Z00FU_uw4op80ADX3cTslQxLPZ8Q-u1K","keyWords":["韩美娟的","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san124","name":"当韩美娟踏入你的生活:百因必有果,你的报应就是我,么么哒!","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","你的","百因必有果","你的报应就是我","韩美娟","你的","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san125","name":"百因必有果,你的报应就是我!被韩美娟折磨的第一天_腾讯视频","value":"2019年9月6日 - 百因必有果,你的报应就是我!被韩美娟折磨的第一天 去下载 下载需先安装客户端 {clientText} 客户端特权: 3倍流畅播放 免费蓝光 极速下载 手...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=1mYh7bd3dlNnDNe1UXJm7bC61MPRq8es-VpWrx8ww5nx9rwEZsB3FOp9nF8uE8YpDR1v_6fD-fD2vmWAkgTL1a","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san126","name":"韩美娟:百因必有果,你的报应就是我_哔哩哔哩 (゜-゜)つロ 干杯...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟 百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san127","name":"韩美娟,“百因必有果你的报应就是我”“不要在网络上哔哔赖赖...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san128","name":"【韩美娟vs萝莉大妈】百因必有果,你的报应就是我;为你按下F键!!!","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san129","name":"百因必有果,你的报应就是我!零零后男生作死挑战韩美娟性感造型...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san130","name":"[韩美娟]百因必有果,你的报应就是我_其他_生活_哔哩哔哩","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟 百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san131","name":"韩美娟 百因必有果 你的报应就是我_搞笑_生活_哔哩哔哩","value":"2019年9月11日 - 韩美娟 百因必有果 你的报应就是我肥水快乐宅爱可乐9896次观看0弹幕9-11 抖音 主页生活搞笑av67313340 搞笑搞笑视频魔性高能韩美娟精彩视频网红抖音 ...","origin":"baidu.com","time":"2019年9月11日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJPER7UUTdULgBDNYe0opg4_","keyWords":["韩美娟 百因必有果 你的报应就是我","韩美娟 百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san132","name":"韩美娟 百因必有果,你的报应就是我。_哔哩哔哩 (゜-゜)つロ 干...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟 百因必有果","你的报应就是我","韩美娟 百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san133","name":"[抖音]韩美娟 百因必有果你的报应就是我,记得双击么么哒_哔哩...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟 百因必有果你的报应就是我","韩美娟 百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san134","name":"【韩美娟vs乔碧萝】百因必有果,你的报应就是我;为你按下F键!!!...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san135","name":"百因必有果,你的报应就是我--韩美娟_搞笑_生活_哔哩哔哩","value":"2019年9月12日 - 百因必有果,你的报应就是我--韩美娟胡子洞1388次观看0弹幕9-12 未经作者授权禁止转载 - 主页生活搞笑av67456743 搞笑傻缺恶搞 收藏 缓存 分享 1 评论 ...","origin":"baidu.com","time":"2019年9月12日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJllZcZ-Ip3mW2yooEXruF6K","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san136","name":"【韩美娟】野狼disco 百因必有果 你的报应就是我_人力VOCALOID_...","value":"2019年9月9日 - 百因必有果 你的报应就是我 记得三连 么么哒 midi:小学生是我师父 素材:抖音 韩美娟 bgm:野狼disco 其他:为何独恋me梦琪","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJlAvUGYuIRPb46t0R9f_lR_","keyWords":["韩美娟","百因必有果 你的报应就是我","百因必有果 你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san137","name":"[洛天依]百因必有果,你的报应就是我(韩美娟)_VOCALOID·UTAU_...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["百因必有果","你的报应就是我","韩美娟","韩美娟","百因必有果"],"type":"san"},{"category":4,"id":"san138","name":"抖音百因必有果你的报应就是我是什么歌?韩美娟唱歌了?_娱乐资讯_...","value":"2019年10月24日 - 最近在抖音上火起来一首歌,里面的经典歌词就是“百因必有果你的报应就是我”,这不是韩美娟的经典成名名句吗?现在还改唱歌了?原来,这首歌是杨...","origin":"baidu.com","time":"2019年10月24日 - ","year":"2019","url":"http://www.baidu.com/link?url=sHFIDHrI6Aq4gd_818xwz7UkxBmqNhDeE2alS8fbkt4cAF82IcBzxq8zl3VyRS7YVCVJTYnHDKQb2kYc1GWzIK","keyWords":["百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san139","name":"百因必有果你的报应就是我的梗出自哪位抖音网红及其表情包","value":"2019年9月10日 - “百因必有果你的报应就是我”的梗出自抖音网红韩美娟之口,他的短视频中,经常出现夸张无厘头的妆发,虽然很多人在第一次看到韩","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=fiuyz80KcH0UzSn-ub3Y1OXILk04uvOXPqO8prOCilvMSG7w0veMwNLydeZQ3591CQ6cNRLlkxvsJPUH8oJ4nq","keyWords":["百因必有果你的报应就是我","百因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san140","name":"百因必有果你的报应就是我什么意思 百因必有果你的报应就是我出处...","value":"2019年9月9日 - 【导读】“百因必有果你的报应就是我”这句话最近在网上超火,据悉,这句话出处来自抖音网红韩美娟之口。那么百因必有果你的报应就是我什么意思?下面来...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=fJKL_Eo5hdGojfBzE-Nd_j751rJeCMCRgYjdEowxn_L74JXevhGsWjoQkRKIzmEOMDPLbfYIXUug9IpUn9ZgIa","keyWords":["百因必有果你的报应就是我","百因必有果你的报应就是我","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san141","name":"【韩美娟rap】有因必有果,你的报应就是我_哔哩哔哩 (゜-゜)つ...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san142","name":"“有因必有果你的报应就是我”!韩美娟的崛起,为什么火遍整条街","value":"2019年9月8日 - 就在最近某短视频平台彻底被一个叫韩美娟的“女人”给沦陷了,据说十条视频九条都是他的,他的一句“有因必有果,你的报应就是我,记得双击么么哒”...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=bdMSgrxEwB9xXNm_jCfAKp0WNWLEYfdz2tdt1RHB5EBDxQpWrESOYHBgRFTZZPWYgaZGQPGwGEx_0UDQw0GGUa","keyWords":["因必有果你的报应就是我","韩美娟","韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san143","name":"“有因必有果,你的报应就是我”韩美娟的崛起,为什么火了整条街","value":"2019年9月8日 - 最近某短视频平台彻底被一个叫韩美娟的“女人”给沦陷了,据说十条视频九条都是他的,他的一句“有因必有果,你的报应就是我,记得双击么么哒”成为了大众...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=zvtaj3oSsYxFJBzzlt55k6lOpVlpoq79ivSE4p24G0lHQB_A9XUyruA2aJFI4t0rDpW8sCuNUZRuxtmaVkvXGkLTcRCQLoU0qkF6e-px8nOzcB2mGPHkJulndhAfi09oc3jGkX4uNsKGyNdOhupjs_","keyWords":["因必有果","你的报应就是我","韩美娟","韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san144","name":"你的报应就是我是什么梗 你的报应就是我的梗出自何处-昕薇网","value":"2019年9月2日 - “有因就有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频当中,他凭借这么一句“有因就有果,你的报应就是我”走红了网红,瞬间刷爆了抖...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=zPYY8aypK0ykclH7JSC4tidBBZTESplXDgj9qk3nnonjkOHTRGQSAlL2VHBuFKr7z1H7U2LjyfSXCQARL1t7Va","keyWords":["你的报应就是我","你的报应就是我","有果","你的报应就是我","韩美娟","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san145","name":"韩美娟 百因必有果,你的报应就是我。_日常_生活_哔哩哔哩","value":"2019年9月7日 - 韩美娟 百因必有果,你的报应就是我。英雄小马仔4640次观看0弹幕9-7 网络 主页生活日常av66900888 韩美娟寄烧鸡么么哒! 收藏 缓存 分享 5 评论 187.5万...","origin":"baidu.com","time":"2019年9月7日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJp4z6i9yLrShFrmbNMSIm6q","keyWords":["韩美娟 百因必有果","你的报应就是我","韩美娟 百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san146","name":"百因必有果,你的报应就是我--韩美娟_哔哩哔哩 (゜-゜)つロ 干...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","就是"],"type":"san"},{"category":4,"id":"san147","name":"韩美娟,“百因必有果你的报应就是我”“不要在网络上哔哔赖赖”“...","value":"2019年9月8日 - 韩美娟,“百因必有果你的报应就是我”“不要在网络上哔哔赖赖”“给个双击么么哒”被她包围是什么感觉??其实本人男装是非常帅气的,唱歌也很好听生活搞...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=I9A739XYhZVkwQ_iuxGmKqzFmFOzlUaw3RhcDqBX-r4d8VAStktMFbGWG798cSCOAvFdS1oEGdyE_3p4Xg9wma","keyWords":["韩美娟","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san148","name":"【佛说】【韩美娟】佛说:百因必有果,你的报应就是我_哔哩哔哩 ...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san149","name":"百因必有果,你的报应就是我_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili","value":"2天前 - 百因必有果,你的报应就是我生活搞笑2019-10-29 18:13:00 --播放 ·...搞笑 恶搞 高能 全程高能 奇葩 魔性 韩美娟 评论 bili懒猫解说发消息 bilibili...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=IshIoZMYUbwGXwRLqMRvUm8tB3o2NpCqaL05Lgv_hkZoG63xuqvfh_6GgvxqFSwW4XmN-JXORaiI5zh2yVjYi_","keyWords":["百因必有果","你的报应就是我","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san150","name":"【百因必有果,你的报应就是我】韩美娟的每一句话都太上头了!_...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san151","name":"大胃王浪胃仙:戏精浪老师韩美娟上身,这声音确定是男孩子吗?_腾讯...","value":"2019年9月5日 - 大胃王浪胃仙:戏精浪老师韩美娟上身,这声音确定是男孩子吗? 去下载 下载需先安装客户端 {clientText} 客户端特权: 3倍流畅播放 免费蓝光 极速下...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=sZZFlru3bqz3-1b5UkNNGKn10nd6YKfuEjVv2iEesBw77rwZRCXFBcF1eYq-hCziijQtQ9zarGlN9Gy62O0Pj_","keyWords":["韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san152","name":"韩美娟和赤木刚宪是情侣?网红界的强强联合,你一定不是最后一个...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san153","name":"原来还有网络红人韩美娟买不起的东西,钱包跟不上了_腾讯视频","value":"2天前 - 陛下,您的Flash插件已过期,无法播放视频了 建议您…...原来还有网络红人韩美娟买不起的东西,钱包跟不上了 ...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=Q9HPPvi4Mcx3u90nB36ZpsrFmwEQhMbrbmcBVd8qVyd9-b8bsTSAprr7TBCtHj-PsLqw1UepLrPlqYqtjPAoX_","keyWords":["韩美娟","您的","韩美娟"],"type":"san"},{"category":4,"id":"san154","name":"【佛说】【韩美娟】佛说:百因必有果,你的报应就是我_搞笑_生活_哔...","value":"2019年9月13日 - 68.8万 183 0:13 百因必有果,你的报应就是我,记得么么哒 App 内打开 134...韩佩泉最牛翻唱《魔鬼中的天使》,最美不过韩美娟! App 内打开 5.3万 4 0:...","origin":"baidu.com","time":"2019年9月13日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJEJziwpFEnQYCVCFL1c7ob_","keyWords":["韩美娟","百因必有果","你的报应就是我","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san155","name":"抖音韩美娟:百因必有果,你的报应就是我-商机讯","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=I8cbWnwL_iGz7VEwdHvyxZrpObVK3UQO2FdOHZVXl1cKa1-JIXzreBSroN2B2RzFbjh9m-RrwFWMKqCXBM6WlK","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san156","name":"【抖音韩美娟:百因必有果,你的报应就是我】-黄页88网","value":"2天前 - 抖音韩美娟:百因必有果,你的报应就是我 短视频界的泥石流,韩美娟的名字你一定不陌生。网红千千万,几乎每月换一拨。从几年前爆火的艾克里里,到去年大皇...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=jTX-lpKyUih26g5_LMgIPBZuEu4syU_P57C7mLE-_yokP3MNT-KPHB8NrR_QvHSzFf87PKjhGha03LcjIMW0rGdRPNeR3j_iihnpMyHVvcu","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san157","name":"韩美娟是00后吗 韩美娟和赤木刚宪在一起了吗,徐昂,徐明浩,徐春妮,...","value":"4天前 - 传闻在一起了,但是并没有得到双方的证实,不过韩美娟和赤木刚宪是很好的...1、百因必有果,你的报应就是我,记得双击么么哒2、不要在网络上逼逼...","origin":"baidu.com","time":"4天前 - ","year":"4","url":"http://www.baidu.com/link?url=Hfx-FhfdpjzGHgKNLj0cwNUklbA4YxnB4saeepCciOVDqcRoVzblYP3WPqYVGbPWqMkj_fEp3_ucTbt44Fti5K","keyWords":["韩美娟是","韩美娟","韩美娟","百因必有果","你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san158","name":"百因必有果,你的报应就是我,是什么意思。-社会民生相关","value":"7天前 - 百因必有果你的报应就是我什么意思…… 额,这是主播韩美娟的恶搞,你可以去看看她的抖音,百因必有果你的报应就是我,记得双击么么哒,有点辣眼睛... 一...","origin":"baidu.com","time":"7天前 - ","year":"7","url":"http://www.baidu.com/link?url=2QJJflkJBw5kO4-2mMlL9ucWYYEmYRyUBZRY8iPLmzAFUWITGLY2v8Jl2-0-W5aMDHKWob5ZGgJLgvqfoJOFFK","keyWords":["百因必有果","你的报应就是我","百因必有果你的报应就是我","韩美娟","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san159","name":"【百因必有果,你的报应就是我】韩美娟的每一句话都太上头了!_搞笑...","value":"2019年9月13日 - 【百因必有果,你的报应就是我】韩美...SAL10244007891306次观看3弹幕9-13 https...64.9万 1259 3:38 韩美娟最新洗脑合集 App 内打开 126.2万 206 0:17...","origin":"baidu.com","time":"2019年9月13日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJ4nsuGGysFtOh1F5_kE2aNK","keyWords":["百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san160","name":"...上韩美娟,我不要你觉得 我要我觉得,百因必有果 你的报应就是我...","value":"2019年9月22日 - 503 0 0:20 韩美娟老师原来这么漂亮! App 内打开 7.8万 79 1:35 韩美娟:百因必有果,你要失恋就找我! App 内打开 3148 1 0:19 韩美娟鬼畜哈哈哈哈哈 ...","origin":"baidu.com","time":"2019年9月22日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJgbRmyjajzzRKjHcSJnIH4q","keyWords":["韩美娟","百因必有果 你的报应就是我","韩美娟","韩美娟","百因必有果","韩美娟"],"type":"san"},{"category":4,"id":"san161","name":"【stitch阿汤】韩美娟仿妆 | 百因必有果,你的报应就是我_美妆_...","value":"2019年9月15日 - 灵魂仿妆韩美娟!百因必有果 你的报应就是我~寄个烧鸡么么哒~ App 内打开 133.6万 214 0:17 韩漂亮,卸掉装唱【静悄悄】 帅呆了 App 内打开 20.3万 ...","origin":"baidu.com","time":"2019年9月15日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJa8P6VWoF3qtC5EVms1cUaK","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san162","name":"韩美娟和赤木刚宪是情侣?看完后,网友:可能我是最后一个知道的","value":"百因必有果,你的报应就是我。韩美娟红了,他极具个人风格的视频让人不想记住都难。画着欧美浓妆,但看着像个大妈,可本人却是个00后大男孩! 气质,我们不需要...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=dg1ZvwqVW67r1lhTNSr90Ga3vWWNOqalM-wp-ZiWCYTu4R_N2lRIPUShun2v4Nq70R7atNR802tskccoLFqnoq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san163","name":"朱梓骁看韩美娟入迷到模仿:百应必有果,你的报应就是我_腾讯视频","value":"2019年9月6日 - 朱梓骁看韩美娟入迷到模仿:百应必有果,你的报应就是我 去下载 下载需先安装客户端 {clientText} 客户端特权: 3倍流畅播放 免费蓝光 极速下载 ...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=UojrdZFZfZ__8xDcy0nfTu_JgntU0YLk8Hcgobtdg3EmGLntdGhV2PIYNquHNdkAZ4mS59hn23VAhQWVgIjdFq","keyWords":["韩美娟","必有果","你的报应就是我","韩美娟","必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san164","name":"“有因必有果你的报应就是我”!韩美娟的崛起,为什么..._手机网易网","value":"2019年9月8日 - 今日大事件:“有因必有果你的报应就是我”!韩美娟的崛起,为什么火遍整条街随着现在网络直播不断地发展,现在有不少人凭借着网络直播分享日常收获不少的...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=5tEMsT1wHPtrQGRyAWhyPmywkFWxz050gdOvTfueLeHx32p_mRML6ZlDZzJYzqXi8xRccbhMpKZWhWKSq9hHMq","keyWords":["因必有果你的报应就是我","韩美娟","因必有果你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san165","name":"“有因必有果你的报应就是我”!韩美娟的崛起,为什么火遍整条街 - ...","value":"2019年9月8日 - 就在最近某短视频平台彻底被一个叫韩美娟的“女人”给沦陷了,据说十条视频九条都是他的,他的一句“有因必有果,你的报应就是我,记得双击么么哒”成为了...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=nOG8XeOOxNvu-R1NoqKPCUlTkcPdm829acCwSmldcY5smcnqLh4DBzg6NWGnoRuvtXr1mUq_pZApMXt13c5HXK","keyWords":["因必有果你的报应就是我","韩美娟","韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san166","name":"百应必有果你的报应就是我是什么梗_百应必有果你的报应就是我出处...","value":"2019年9月5日 - “百应不有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频中,凭借这句“百应不有果,你的报应就是我”瞬间走红于各大网络平台。 韩...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=Zhy6tjzBb2gc71LlGaX6UUKMrjpBfRMx5Rd6GczRMTHrziBlxknAZwIca9RpjpTeNoMvRkqzYcELtnu0O8tL2a","keyWords":["必有果你的报应就是我","必有果你的报应就是我","有果","你的报应就是我","韩美娟","有果","你的报应就是我","韩"],"type":"san"},{"category":4,"id":"san167","name":"一个男孩对女孩说百因必有果你的报应就是我什么意思_百度知道","value":"最佳答案: 意思就是上天派他来祸害你的,他就是你的因果报应,如果你俩没什么事,就是开玩笑说的不必在意\n更多关于韩美娟百因必有果你的报应就是我林自勇就是牛逼的问题>>","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=03KNATV6uZZf961k1KEC6FusXevbUtY3RebtR-yanZsJQvb-6P5kO73sULJ1VBsWFr3CsxrMOsE2GMntjkSfaGgJjPqbKqe5fNMJcfvTTWq","keyWords":["百因必有果你的报应就是我","就是","你的","就是你的","果报应","果你","就是"],"type":"san"},{"category":4,"id":"san168","name":"百因必有果,你的报应就是我 是什么意思呢?_百度知道","value":"最佳答案: 　“百因必有果你的报应就是我”是什么意思? 原本这句话的意思是:结果是由不同的原由导致的,人如果做了不好的事肯定会有报应的。但是这句话配上...\n更多关于韩美娟百因必有果你的报应就是我林自勇就是牛逼的问题>>","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=VSxaIimniF4NroI6qn1_Uwf9Sl35mLPfzsOFiWKOIBFSfDfQQCxYeJgjMvQ7SSQ6sEW1o3M-cZSuNBtz89QejWnD4zb9gXhB_El7sgXWoDe","keyWords":["百因必有果","你的报应就是我","百因必有果你的报应就是我"],"type":"san"},{"category":4,"id":"san169","name":"月饼界的韩美娟:一发过敏,二发上瘾——你的报应就是我!","value":"2019年9月12日 - 毕竟谁的人生没有一两个吃屎的中秋节呢? 作为过来人,德文只想说: 作者最新文章 月饼界的韩美娟:一发过敏,二发上瘾——你的报应就是我! 09-1222:20 瓶...","origin":"baidu.com","time":"2019年9月12日 - ","year":"2019","url":"http://www.baidu.com/link?url=_gPrPVArMK447p28q5HrASnulSJ4ejVpmP406RJv-SLapTkvGAWHkPLMd_2ZKjBZJ1hoKSpMbqAfnLM58eBYv0ehTAypXfnuLJmGZyGGvze","keyWords":["韩美娟","你的报应就是我","韩美娟","你的报应就是我"],"type":"san"},{"category":4,"id":"san170","name":"男粉丝仿妆“韩美娟”,看开头:开玩笑呢?成品:你的报应就是我","value":"2019年9月9日 - 看到小伙子最后的妆容,人们的脑海中纷纷的冒出了这么一句话,百因必有果,你的报应就是我。这是一张拼接图片,上图为韩美娟本人,而下图则是这位美妆博...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=1282f2ni3_n7iVFaBXflCLNuWLy3rc3bnCijYXtvesjMO-z3jvUcMj97Tt9rFDv5Cu9F1589yYsjLGL14plxyK","keyWords":["韩美娟","你的报应就是我","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san171","name":"【韩美娟rap】有因必有果,你的报应就是我_哔哩哔哩 (゜-゜)つロ ...","value":"2019年9月6日 - 不要在评论里哔哔赖赖,有本事现实碰一碰,你看我扎不扎你就完了 ...【韩美娟】韩美娟rap单曲,百因必有果,你的报应就是我。 清溪鬼咕子 1.6万播放...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=rRuRuwLI2n-43wd3TYseu6693Ovwm-jcKrtawQLHfAKN4mGB4B8UG3DMxbTe_nBnoFgsGub5r20Z7YRPdtQmAa","keyWords":["韩美娟","因必有果","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san172","name":"百因必有果 你的报应就是韩美娟_哔哩哔哩 (゜-゜)つロ 干杯~-...","value":"你的报应就是韩美娟 关注 播放器初始化...[完成]加载用户配置...[完成] 00...00:48韩美娟,百因必有果出处我的中文名字叫小沈阳 7197播放 · 0弹幕 05:11...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=mZ_O6_Hvl7JpZ37vicY5TyTjEMEnjqxxNe3NE2E63N5h2jRvtjEazq0ibSjvjx25GmczJNCYQX8mJoe67YTqZK","keyWords":["百因必有果 你的报应就是韩美娟","你的报应就是韩美娟","韩美娟","百因必有果"],"type":"san"},{"category":4,"id":"san173","name":"百因必有果,你的报应就是韩美娟小姐姐。记得三连么么哒!_搞笑_...","value":"2019年9月2日 - 百因必有果,你的报应就是韩美娟小姐...史为杰最聪明2.3万次观看7弹幕9-2 抖音用户韩美娟 主页生活搞笑av66381230 高能奇葩魔性精彩视频美女主播抖音 ...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJt09n4xOV4rGxfFKhXG4ECa","keyWords":["百因必有果","你的报应就是韩美娟","百因必有果","你的报应就是韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san174","name":"【韩美娟】你的报应就是我!_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili","value":"2019年9月6日 - 【韩美娟】你的报应就是我!鬼畜鬼畜调教2019-09-06 15:13:00...四十五秒整一个百因必有窝窝头的电音 Psycho撑不下去STUDIO 132播放 · ...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=QACYjQ53hOQDDI1QF6Zb-WF3rXNNI8rvOfZJe-sagqPtubw-vmSMLRyLyR9Z3zjlQKMcel6lleF3jduocPV6EK","keyWords":["韩美娟","你的报应就是我","韩美娟","你的报应就是我","百因必有"],"type":"san"},{"category":4,"id":"san175","name":"抖音韩美娟:百因必有果,你的报应就是我_燃料油期货-东证期货-黄金...","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=n4kD1yJllEnBFfCwYk9vAjp8enIY1VI5gefExEVZPs8pBU_bg6NBpFFPvPeNb5AyopyUxy2mx_EGMofm_m7ibjfO4GoWD74_R9lup-_jWhK","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san176","name":"...知名百万阿婆主受到韩美娟的制裁!百因必有果~你的报应就是鹅~_...","value":"2019年9月26日 - 【萧忆情】2019.9.25 酷狗直播全程屏录 知名百万阿婆主受到韩美娟的制裁!百因必有果~你的报应就是鹅~生活其他2019-09-26 00:00:05...","origin":"baidu.com","time":"2019年9月26日 - ","year":"2019","url":"http://www.baidu.com/link?url=zeCCJNDLXQEw-fD0kX3HmhgHS6BI1Pv7JfyFyuCPX2lMf3bCEcSlAlmRLpnQmeOLX1vgyx-sDN-NNgqZL0kdYK","keyWords":["韩美娟的","百因必有果","你的报应就是","韩美娟","百因必有果","你的报应就是"],"type":"san"},{"category":4,"id":"san177","name":"【韩美娟】我就是新晋念诗之王,什么都别说了,你的报应就是我_...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","就是","你的报应就是我","韩美娟","你的报应就是我"],"type":"san"},{"category":4,"id":"san178","name":"男女分别会因为什么而挽留,挽回你呢?_哔哩哔哩 (゜-゜)つロ 干杯~...","value":"1天前 - 韩美娟老师仿妆——有因必有果,你的报应就是我 小裤衩era 3351播放 · 302弹幕 04:50 农村离婚姑娘去对象家,看姑娘的做法,就知道是过日子的人! 鲁...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=7aLW_h2o2G6Ea4b7eigj6R1eZ1Hy5Er8Oof60zIwACsvSPepIrXWRs5zQ891d4r3QdPpMrqtugPgRn-GsZht6a","keyWords":["韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san179","name":"男女分别会因为什么而挽留,挽回你呢?_哔哩哔哩 (゜-゜)つロ 干杯~...","value":"1天前 - 韩美娟老师仿妆——有因必有果,你的报应就是我 小裤衩era 3351播放 · 302弹幕 04:50 农村离婚姑娘去对象家,看姑娘的做法,就知道是过日子的人! 鲁...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=jhLIFt0758GsHoLZAW2napY2RHqXHKEnYZyNM0E7OeptsLABK4xFyNG1itRs8FqIJ15HsvtOfE6qKQmPPCKVa_","keyWords":["韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san180","name":"抖音韩美娟:百因必有果,你的报应就是我 - 12小时新闻网(12hnews...","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=HSCsglx-uP6C2L7F7KOfTqPuviewxKekchaR5uKYeh1fX7r6TfU6ZJEx04hiM25vJrZIjKXuLq6KYZUdO6sL4K","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san181","name":"抖音韩美娟:百因必有果,你的报应就是我_新闻资讯免费发布--绍兴...","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=RrIPka3Vv3HvN3bi7haRKp1FgJfVRb1nJfcYmIzNKpda3IXJ0kVFzsOe21tCGhCZ","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san182","name":"抖音韩美娟:百因必有果,你的报应就是我 - 欧华导航(www.ohdh.com)","value":"抖音韩美娟:百因必有果,你的报应就是我短视频界的泥石流,韩美娟的名字你一定不陌生。网红千千万,几乎每月换一拨。从几年前爆火的艾克里里,到去年大皇子“苏...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=UDdj_TJfPZJmJrGFDBSluYOqlsSrvat3QQqG2fBAucDv3RLtBzqcwvdgB6umyJr-3M87Rh3Yq6P4JyT2Dzz7dq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san183","name":"抖音韩美娟:百因必有果,你的报应就是我 - 资讯频道","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=gbXIXW--yHO7JUJ-PxU1d4dQZvXbD6hH4RfoTEFKqCPMlBLJ17XblYq-cCfqs8USop2mEvqQRPZehRdm9zc1VSkIcWNN2bk6njzCn5uvHaK","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san184","name":"抖音韩美娟:百因必有果,你的报应就是我 - 北京热线","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=xDVA5dEFcZGBuxrwQj9NSs3Ce6YnNMCl96PXT6H8NjfIbvx9Swu0As2C8_xh0Z_vLRQK7ZqW9PdWZg7tRd8px_","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san185","name":"抖音韩美娟:百因必有果,你的报应就是我_热点聚焦_文章频道","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=Ervr9ehP8tMUwzTdLnTAWNYsq7nYntZo2kPnTwWyEN5Evflo7aIlhlvDeLLi5uM5Qwa9slA2-qdLgekmSjHenK","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san186","name":"抖音韩美娟:百因必有果,你的报应就是我 - 科技资讯 - 中国网络...","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=NXwMRhDJ8Kg606qU9LHbWt4Bk6Lx8G34VVQJ-reRiIhEDES1gG4Sxi4aQTN61XQFqHSAhG0z3kICJe8g0cS1Dq","keyWords":["韩美娟","百因必有果","你的报应就是我","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san187","name":"【韩美娟rap】有因必有果,你的报应就是我_鬼畜调教_鬼畜_哔哩...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san188","name":"首次女装不忍直视?跟着抖音韩美娟化妆?百因必有果,你的报应我...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","百因必有果","你的报应我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san189","name":"百银必有果,你的报应就是我。全网都被韩美娟洗脑了!_腾讯视频","value":"2019年9月10日 - 百银必有果,你的报应就是我。全网都被韩美娟洗脑了! 去下载 下载需先安装客户端 {clientText} 客户端特权: 3倍流畅播放 免费蓝光 极速下载 ...","origin":"baidu.com","time":"2019年9月10日 - ","year":"2019","url":"http://www.baidu.com/link?url=F8EDU-ldxEDiYpl0-mqVrmMrEHsTD9ZoIv6eRuAyI77t47fosI9ksjDfdI-1O0IVfHEC8u3Y1bpx_Ioq0ZATMa","keyWords":["必有果","你的报应就是我","韩美娟","必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san190","name":"“抖音一姐”韩美娟,你凭什么一月涨粉700万?_好生意","value":"2天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"2天前 - ","year":"2","url":"http://www.baidu.com/link?url=jilFWuPKsCWM7ETN8dL2VajjumFxlkAb5nfS1vTliml5A9-MqaRNckXI6G84D5OHP1I7PdzNN66dBagAZVcy5K","keyWords":["韩美娟","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san191","name":"首次女装不忍直视?跟着抖音韩美娟化妆?百因必有果,你的报应我来了...","value":"2019年9月5日 - 3166 4 0:13 韩美娟:百因必有果,你的报应就是我 App 内打开 2538 1 0:22 韩美娟,嘴吸蛇毒了吗? App 内打开 5.6万 23 0:19 当韩美娟闯入你的生活 App...","origin":"baidu.com","time":"2019年9月5日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJ1Q2radAH3M06nvC-bw8TFq","keyWords":["韩美娟","百因必有果","你的报应我","韩美娟","百因必有果","你的报应就是我","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san192","name":"抖音韩美娟资料、哪里人 你的报应就是我什么梗 - 淑女志","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫韩美娟的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句百因必有果,你的报应就是我,就是从...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=S0dDlAH85OZig-iQcUrk-8zC2o7UdTZEoQJR3bImitaZ66LLwyFLqnSXEyY82Lgq-gHhrcgA0bVlwUG9AM1EhK","keyWords":["韩美娟","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我","就是"],"type":"san"},{"category":4,"id":"san193","name":"你的报应就是我什么梗?你的报应就是我的梗什么意思出自何处","value":"2019年9月4日 - 原标题:你的报应就是我什么梗?你的报应就是我的梗什么意思出自何处 近日,抖音。快手等社交平台,都流行起来一个有因就有果,你的报应就是我的梗,...","origin":"baidu.com","time":"2019年9月4日 - ","year":"2019","url":"http://www.baidu.com/link?url=GzTqPq4RzrIXyMkERnXvlmRWQDJ7OfhRbBNgWXvX0UfRsW4WiiJpi7A5XhC33XrRGr5T3y3GNr8bRDZ8DGZ8eBFQjf0anNwtnhpmchKW95K","keyWords":["你的报应就是我","你的报应就是我","你的报应就是我","你的报应就是我","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san194","name":"一夜爆火韩美娟表情包 丨你的报应就是我","value":"2019年9月6日 - 韩美娟真人表情包 图片已调整为表情格式 长按发送即为表情包 百因必有果你的报应就是我 百因必有果 你的报应就是我 不要在网络上BB赖赖 不服现实...","origin":"baidu.com","time":"2019年9月6日 - ","year":"2019","url":"http://www.baidu.com/link?url=A7gwynVxM65_4tz82DMPA2jrdhNQyPvC_Q1OcvhIM2yY7pICBux2vRYAqgN0GSRMOz7dCkTyTm-SbSiJ54zZHa","keyWords":["韩美娟","你的报应就是我","韩美娟","百因必有果你的报应就是我","百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san195","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿--豪仕阅读网","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=zBJvJZBoZpuB0lLf5fW5mnR6dfZM8jjSWkjNpn9NwWDDWqhNwA5kqj6FLwf_qDj8tpLVVK1i2JUveXLraxw7-a","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san196","name":"【韩美娟】你的报应就是我!_鬼畜调教_鬼畜_哔哩哔哩","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","你的报应就是我","是我"],"type":"san"},{"category":4,"id":"san197","name":"百应必有果你的报应就是我是什么梗-百应必有果你的报应就是我的...","value":"2019年9月9日 - “百应不有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频中,凭借这句“百应不有果,你的报应就是我”瞬间走红于各大网络平台...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=Ln7NTXwGJNmISOMtps7b9HhSbdw0fgUsdwiRnXrtTOGahFFlCupt6LKga0EwO9xexIOgGEVjwZYx84oN8XqXxa","keyWords":["必有果你的报应就是我","必有果你的报应就是我","有果","你的报应就是我","韩美娟","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san198","name":"你的报应就是我是什么梗 你的报应就是我的梗出自何处-昕薇网","value":"“有因就有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频当中,他凭借这么一句“有因就有果,你的报应就是我”走红了网红,瞬间刷爆了抖...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=jGHcDDjeNWEsZHMG1YEZdb2YbgfwOL2aIC9UUDXafu9XVOLK9edoI3nUUWbmud5KEO6U4jRqzcxRx3CU8JoOZa","keyWords":["你的报应就是我","你的报应就是我","有果","你的报应就是我","韩美娟","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san199","name":"你真的了解抖音网红韩美娟吗?_武汉中秘网络传媒有限公司","value":"1天前 - 韩美娟除了夸张的外表外,还有另一个特点那就是“娟言娟语”,发布的短视频中的“百因必有果你的报应就是我”、“记得双击么么哒”、“逼逼赖赖,...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=T-8HMH86CYIuKAryEPxm40mjr6TqwZYsS1ahUQ1PMWO317Lca3dXgdPpszFgjbzPzjZJ4bAwOA24o4viLESIJxjt0OM9mhfT3TELJKOOgBK","keyWords":["韩美娟","韩美娟","百因必有果你的报应就是我","逼逼"],"type":"san"},{"category":4,"id":"san200","name":"奶奶你的报应就是我!#韩美娟-原创-高清正版视频在线观看–爱奇艺","value":"2019年9月7日 - 奶奶你的报应就是我!#韩美娟 奶奶你的报应就是我!#韩美娟 发布时间: 2019-09-07 分享 下载 收藏 举报 更多 公司介绍 | 新闻动态 | 联系...","origin":"baidu.com","time":"2019年9月7日 - ","year":"2019","url":"http://www.baidu.com/link?url=Yt17W81NymVjt0lITgKBjpeKdhNd9Avo3iDRdrG4Ak6G5hvDWuGITP7cJZbI15Xx","keyWords":["你的报应就是我","韩美娟","你的报应就是我","韩美娟","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san201","name":"你的报应就是我什么梗 最近网上十分流行|你的|报应-社会资讯-川北...","value":"2019年9月3日 - 原标题:你的报应就是我什么梗 最近网上十分流行 近日,抖音。快手等社交平台,都流行起来一个有因就有果,你的报应就是我的梗,这个梗是什么意思呢?...","origin":"baidu.com","time":"2019年9月3日 - ","year":"2019","url":"http://www.baidu.com/link?url=7R1nAXTeECMxAMRH8-yaWoQlMjOHj2no-MnWVM0XZne99pg0hw2cD4bVHFILNO11NQvnmHVJno5x0nuvu20Rpzy4KN8RH7_HJ4A8In7D99e","keyWords":["你的报应就是我","你的报应就是我","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san202","name":"【韩美娟鬼畜】芒种——你的报应就是我_哔哩哔哩 (゜-゜)つロ ...","value":"2019年9月4日 - 活动作品【韩美娟鬼畜】芒种——你的报应就是我鬼畜鬼畜调教2019-09-04 17:34:13 --播放 · --弹幕未经作者授权,禁止转载...","origin":"baidu.com","time":"2019年9月4日 - ","year":"2019","url":"http://www.baidu.com/link?url=y1fhnkIjqtokt7eo3xHXKChPgahx1jRyARmQk8zKcQpHJoEWuaiRP23yONZ_2ZJCITF6UGoyC2BckYNkkSlMoK","keyWords":["韩美娟","你的报应就是我","韩美娟","你的报应就是我"],"type":"san"},{"category":4,"id":"san203","name":"【韩美娟rap】你的爱情就是我_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili","value":"百因必有果,你的爱情就是我记得三连么么哒~~... 00:08韩美娟灭龙魔导士多拉格尼尔 96.3万播放 · 225弹幕 00:52听了百因必有果,你的报应就是我,一遍和...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=fDU51VYI9p72YPHQtm6Umyhn9i99AukK3rUlNKPUWWyiDQSZsuHKShg8ltFEOO7s93kFkC1YpzaX6vYP0qjR8q","keyWords":["韩美娟","你的","就是我","百因必有果","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san204","name":"【韩美娟鬼畜】百嘤必有果,你的报应就是窝,记得双击么么哒!_鬼畜...","value":"2019年9月14日 - 【韩美娟】韩美娟rap单曲,百因必有果,你的报应就是我。 App 内打开 8.8万 22 0:12 介绍一下,这是我十杯珍珠奶茶都不换的女孩 恩! App 内打开 3.9万 7...","origin":"baidu.com","time":"2019年9月14日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJqv20mn5S4crDpjeKBMsO2a","keyWords":["韩美娟","必有果","你的报应就是","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san205","name":"《韩美娟》你的报应就是我原版视频,恭喜你们找到了万恶之源!_哔哩...","value":"百因必有果,你的报应就是我,记得么么哒 精神分裂的戏精 49.9万播放 · 133弹幕 04:34 韩美娟的《雅俗共赏》出来后,立刻被她的魔性声音洗脑,已跪拜!...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=lGToriBPLd1qRNaUmgR3knBTORcupKR46nsG2QYVxV8b9lpfTKgK6DddTXCpKk0cww5rNVkxl7Fk95DhpIHt5a","keyWords":["韩美娟","你的报应就是我","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san206","name":"憋笑大挑战:无处不在的韩美娟,声音令我陶醉,你的报应就是我","value":"2019年10月20日 - 憋笑大挑战:无处不在的韩美娟,声音令我陶醉,你的报应就是我 发布时间: 2019-10-20 分享 下载 收藏 举报 更多 ...","origin":"baidu.com","time":"2019年10月20日 - ","year":"2019","url":"http://www.baidu.com/link?url=_985wltrYyRmQgwPWoKzLuKv9mLYpk1QHlUUQujVtpgB51uhryfVIzwjf_mzWKXC","keyWords":["韩美娟","你的报应就是我","韩美娟","你的报应就是我"],"type":"san"},{"category":4,"id":"san207","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 奢影...","value":"2019年9月2日 - 据悉,那一句“百因必有果,你的报应就是我”,就是从韩美娟那里来的。此梗近日来还被众网友所模仿,看来大家都中了韩美娟的毒了!...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=DqcUYhyB3xBkZjRa5gi3nRcNp3TTS-jvbj-7BpG42rk-XIdz1APz1GI58d7ictR1Y60ec1XX0_ccYhs4-B7ylq","keyWords":["韩美娟是","你的报应就是我","百因必有果","你的报应就是我","就是","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san208","name":"抖音韩美娟表情图片下载-韩美娟表情包(你的报应就是我)下载无水印...","value":"2019年9月8日 - 百因必有果下一句就是:你的报应就是我。这句话来自于抖音上的网红韩美娟。别看韩美娟化了化妆很油腻的样子,韩美娟表情包,但其实他是一个男的,而且...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=vC8Iz5Kr-n7wrX7HjTrDOE1IWoGVuVB6o_UtOyS1eea43gEBqwu2rmqr2HMWwbYR","keyWords":["韩美娟","韩美娟","你的报应就是我","百因必有果","你的报应就是我","韩美娟","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san209","name":"韩美娟 你的报应就是我_搞笑_生活_哔哩哔哩","value":"2019年9月8日 - 388 0 2:08 韩美娟心动瞬间第三弹 App 内打开 3166 4 0:13 韩美娟:百因必有果,你的报应就是我 App 内打开 2.1万 4 0:16 不要再网络上比比赖赖 App...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJAHxZQH2R1NT2KwrXEl8LuK","keyWords":["韩美娟","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san210","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 惠民小...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=JSirxb2UVRZ1atJyuEBpyCJ6Sa6peIRiODX1fWwieVYuaK1qkxVwVy9h4_svjxrFQIyDJZVzjlUKwifGpxZXS_","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san211","name":"你的报应就是我什么梗?你的报应就是我的梗什么意思出自何处","value":"2019年9月4日 - “有因就有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频当中,他凭借这么一句“有因就有果,你的报应就是我”走红了网红,瞬...","origin":"baidu.com","time":"2019年9月4日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8zWE5epzov3Jk7LtVUL7ckVVRuhcmg_LSlmFWoqIUwcLDv0LDKqxaVjwoi_SioGAiHISwkkN6UaH9R5DHJNyEC","keyWords":["你的报应就是我","你的报应就是我","有果","你的报应就是我","韩美娟","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san212","name":"《韩美娟》你的报应就是我原版视频,恭喜你们找到了万恶之源!_...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","你的报应就是我","韩美娟","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san213","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 趣事 - ...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=AOdQW1_AweWivgfToff4yDmF-1oaYHo13kxi-zhikOq4tbjwWlwqEysSZIoOp-AP-yCbG7B0JASaT4MugtO4OK","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san214","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 趣事 - ...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=fRH89foMjV_YHGFLF939cprurU__thYvAwOvYy12xJFnWTx0Qwf-W0M3CAGygVkhDN3eOb7gAMO--L-X-BUWNq","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san215","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 娱乐 - ...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=54gLyZmZnQrluKQxlZWepybfcN8cfSg4WRKwUxRM7gKZIpkE_RdXp_KJXelsmQKOq_xcCGwgs09-KrDC13HlLq","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san216","name":"小姐姐仿妆“韩美娟”,开局:把眉毛刮了,最后:你的报应就是我","value":"2019年10月1日 - 最近网上流传着一个经典的语录,“百因必有果,你的报应就是我”,应该都听过的吧,就是一个小哥哥总是画着夸张的欧美妆容,是韩美娟没错了,太魔性了...","origin":"baidu.com","time":"2019年10月1日 - ","year":"2019","url":"http://www.baidu.com/link?url=XLvQGGmvBDwz9qMYNlajhEZRq01szAXkhTVMGIKGSvt0L2kH3zyheqFIC6Azv98m0t0zA7ztmKemUDGnhKzqfq","keyWords":["韩美娟","你的报应就是我","百因必有果","你的报应就是我","就是","韩美娟"],"type":"san"},{"category":4,"id":"san217","name":"你的报应就是我什么梗?你的报应就是我的梗什么意思出自何处_明星...","value":"2019年9月3日 - “有因就有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频当中,他凭借这么一句“有因就有果,你的报应就是我”走红了网红,瞬...","origin":"baidu.com","time":"2019年9月3日 - ","year":"2019","url":"http://www.baidu.com/link?url=Hfx-FhfdpjzGHgKNLj0cwNUklbA4YxnB4saeepCciOTBGvZP1VrbMTwScaRTGehbVbcn_8UEK7ei5yua6iDU357vVL4x0WYoGMZYg4r_S-3","keyWords":["你的报应就是我","你的报应就是我","有果","你的报应就是我","韩美娟","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san218","name":"一夜爆火韩美娟表情包 丨你的报应就是我","value":"2019年10月17日 - 韩美娟真人表情包 图片已调整为表情格式 长按发送即为表情包 百因必有果你的报应就是我 百因必有果 你的报应就是我 不要在网络上BB赖赖 不服现实...","origin":"baidu.com","time":"2019年10月17日 - ","year":"2019","url":"http://www.baidu.com/link?url=KoE_En19ElEYaVa07yQVEmJUeFzatiQqtkcLGNdE6UZWTRUS74DI9aJck9n7DEcVwJd5hSsDRRnie6Fmw13bM_","keyWords":["韩美娟","你的报应就是我","韩美娟","百因必有果你的报应就是我","百因必有果 你的报应就是我"],"type":"san"},{"category":4,"id":"san219","name":"对不起!韩美娟老师你这致命的魅力就是我的报应_腾讯视频","value":"2019年10月16日 - 对不起!韩美娟老师你这致命的魅力就是我的报应 去下载 下载需先安装客户端 {clientText} 客户端特权: 3倍流畅播放 免费蓝光 极速下载 手机看 ...","origin":"baidu.com","time":"2019年10月16日 - ","year":"2019","url":"http://www.baidu.com/link?url=1ivt0_hOIrn9-z4L12QIxJGk_HJkTohAPFd1U73XvmUyhvD0856Omj-sZL49IjfOsAVYPT71ihK7aInNtCiJ8a","keyWords":["韩美娟","就是我的报应","韩美娟","就是我的报应"],"type":"san"},{"category":4,"id":"san220","name":"你的报应就是我什么梗?你的报应就是我的梗什么意思出自何处 - ...","value":"2019年9月3日 - “有因就有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频当中,他凭借这么一句“有因就有果,你的报应就是我”走红了网红,瞬...","origin":"baidu.com","time":"2019年9月3日 - ","year":"2019","url":"http://www.baidu.com/link?url=0rza4D2vsZeRW_Ei9unWd8yGgjFrnqxXNL7zB1VI7duPtyx0GMbI1FwVWl79EomL5cH8vtteKMLg2eg0TfPI4_","keyWords":["你的报应就是我","你的报应就是我","有果","你的报应就是我","韩美娟","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san221","name":"头都笑掉了,当你把影 流之 主和新 宝 岛推荐给老板看,当场懵逼","value":"1天前 - 头都笑掉了,当你把影 流之 主和新 宝 岛推荐给老板看,当场懵逼...韩美娟:百因必有果!你的报应就是我! 光点工作室 5286播放 · 2弹幕 ...","origin":"baidu.com","time":"1天前 - ","year":"1","url":"http://www.baidu.com/link?url=OmFycakh2pXfXJAc5ux8tP19ssFLZ_A3PNCvuhasSsPHHORs_EuD7lUr8jp3pqfkrmvBPJhP3MNGOxIeqWbZO_","keyWords":["韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san222","name":"来左边一起百应必有果,其实你的报应就是我_搞笑_生活_哔哩哔哩","value":"2019年9月9日 - 68.7万 183 0:13 百因必有果,你的报应就是我,记得么么哒 App 内打开 138.2万 1062 1:00 我们宿舍也中毒了 App 内打开 15.4万 35 0:19 韩美娟居然...","origin":"baidu.com","time":"2019年9月9日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJmjp7wKSXbq9sXXL0WpTYga","keyWords":["必有果","你的报应就是我","百因必有果","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san223","name":"一夜爆红的“抖音大妈”和她背后的 19 岁男人_手机搜狐网","value":"最近由两句话在网上爆红,一句是「记得双击么么哒」、另一句是「百因必有果,你的报应就是我」。 看到「记得双击么么哒」,我以为应该是某年轻漂亮的小网红说...","origin":"baidu.com","time":null,"year":null,"url":"http://www.baidu.com/link?url=PMjcK_cLxQyOCN4rcAiyS-jF8B6w1-HbI34zgU1MUIc3vLuhxQgJDKnT6t2VQfxX","keyWords":["百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san224","name":"你的报应就是我_中华头条","value":"2019年9月18日 - 史上最「恶心」网红韩美娟 让我看到了人性真实的一幕 你的报应就是我 百因必有果 韩美娟 史上最「恶心」网红 2019-09-18 09:55:33 围堵香港...","origin":"baidu.com","time":"2019年9月18日 - ","year":"2019","url":"http://www.baidu.com/link?url=eoHvj59Bbw1b3PFaLSN5va85H6F8IYNeas-nGGegS3cMFrgK6ufUWnNRKXHSqufj-7X0bvckPyJ1HMXqjuIp2eH05r8xiAHHB3bGyJxl4Wi","keyWords":["你的报应就是我","韩美娟","你的报应就是我","百因必有果","韩美娟"],"type":"san"},{"category":4,"id":"san225","name":"抖音韩美娟表情图片下载-韩美娟表情包(你的报应就是我)下载无水印...","value":"2019年9月8日 - 百因必有果下一句就是:你的报应就是我。这句话来自于抖音上的网红韩美娟。别看韩美娟化了化妆很油腻的样子,韩美娟表情包,但其实他是一个男的,而且...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=GrFfMQXhZ-B79c1tmicMlzfOh-_bCWoJS1alzsIeLieTImh7JEH4YJA8k2RIO8CN","keyWords":["韩美娟","韩美娟","你的报应就是我","百因必有果","你的报应就是我","韩美娟","韩美娟","韩美娟"],"type":"san"},{"category":4,"id":"san226","name":"韩美娟 你的报应就是我_搞笑_生活_哔哩哔哩","value":"2019年9月8日 - 388 0 2:08 韩美娟心动瞬间第三弹 App 内打开 3166 4 0:13 韩美娟:百因必有果,你的报应就是我 App 内打开 2.1万 4 0:16 不要再网络上比比赖赖 App...","origin":"baidu.com","time":"2019年9月8日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8b-omKc3ap2x5EsTpVbV63zHCo3-j3JI9VI2shCRFuJAHxZQH2R1NT2KwrXEl8LuK","keyWords":["韩美娟","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san227","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 惠民小...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=DyviJtQftdP03RA13Bblxmg7EniMKFt_GF6D6xFSMYE8DRPRdouMZmCd2tTco7u3q1Mwzv9dvhn5fhszTyte7a","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san228","name":"你的报应就是我什么梗?你的报应就是我的梗什么意思出自何处","value":"2019年9月4日 - “有因就有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频当中,他凭借这么一句“有因就有果,你的报应就是我”走红了网红,瞬...","origin":"baidu.com","time":"2019年9月4日 - ","year":"2019","url":"http://www.baidu.com/link?url=57aywD0Q6WTnl7XKbIHuE8zWE5epzov3Jk7LtVUL7ckVVRuhcmg_LSlmFWoqIUwcLDv0LDKqxaVjwoi_SioGAiHISwkkN6UaH9R5DHJNyEC","keyWords":["你的报应就是我","你的报应就是我","有果","你的报应就是我","韩美娟","因","有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san229","name":"《韩美娟》你的报应就是我原版视频,恭喜你们找到了万恶之源!_...","value":null,"origin":"baidu.com","time":null,"year":null,"url":null,"keyWords":["韩美娟","你的报应就是我","韩美娟","你的报应就是我","韩美娟"],"type":"san"},{"category":4,"id":"san230","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 趣事 - ...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=4DeZ4U2JG8TZLa9UnFFlu_vS_J55IS2Wqo7GZVAC5rvxp_H3Fmrlw8y065HNdAgann3klc2VezKelOpiUj89kq","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san231","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 趣事 - ...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=6H4tjj-b62KorU9Gl0GmYU53r9vbQ02kvNLfuF7NHwMkmFjar2TM59M_0qHZhiMm26eW9GZETb06MfG1qfi-pa","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san232","name":"抖音韩美娟是谁 “你的报应就是我”此梗被众网友所模仿 - 娱乐 - ...","value":"2019年9月2日 - 近日,抖音、快手等社交平台,都被一位叫“韩美娟”的网友刷屏了。因此,让不少网友好奇到,韩美娟是谁?据悉,那一句“百因必有果,你的报应就是我”,...","origin":"baidu.com","time":"2019年9月2日 - ","year":"2019","url":"http://www.baidu.com/link?url=chW_bNzyMMfkIJJEf_DLLfsAEesNRGNCOy1BV2ZVmi8KNZeNMc15UyLR3RFKqjPBHlxyXz0isHC40Tr4gXVYq_","keyWords":["韩美娟是","你的报应就是我","韩美娟","韩美娟","百因必有果","你的报应就是我"],"type":"san"},{"category":4,"id":"san233","name":"小姐姐仿妆“韩美娟”,开局:把眉毛刮了,最后:你的报应就是我","value":"2019年10月1日 - 最近网上流传着一个经典的语录,“百因必有果,你的报应就是我”,应该都听过的吧,就是一个小哥哥总是画着夸张的欧美妆容,是韩美娟没错了,太魔性了...","origin":"baidu.com","time":"2019年10月1日 - ","year":"2019","url":"http://www.baidu.com/link?url=sNO21aF8davHOBshtjxuhoZoYpU08zdqMhcomgytCpP2rPYVWSXOeQk50OwZncLmYqNwEoBlFYm5T_Yoj3pqQ_","keyWords":["韩美娟","你的报应就是我","百因必有果","你的报应就是我","就是","韩美娟"],"type":"san"},{"category":4,"id":"san234","name":"你的报应就是我什么梗?你的报应就是我的梗什么意思出自何处_明星...","value":"2019年9月3日 - “有因就有果,你的报应就是我”是出自于一位叫做“韩美娟”的网红,在他的视频当中,他凭借这么一句“有因就有果,你的报应就是我”走红了网红,瞬...","origin":"baidu.com","time":"2019年9月3日 - ","year":"2019","url":"http://www.baidu.com/link?url=Hfx-FhfdpjzGHgKNLj0cwNUklbA4YxnB4saeepCciOTBGvZP1VrbMTwScaRTGehbVbcn_8UEK7ei5yua6iDU357vVL4x0WYoGMZYg4r_S-3","keyWords":["你的报应就是我","你的报应就是我","有果","你的报应就是我","韩美娟","因","有果","你的报应就是我"],"type":"san"}],"links":[{"source":"key0","target":"san0","value":1},{"source":"key0","target":"san1","value":1},{"source":"key0","target":"san2","value":1},{"source":"key0","target":"san3","value":1},{"source":"key0","target":"san4","value":1},{"source":"key0","target":"san5","value":1},{"source":"key0","target":"san6","value":1},{"source":"key0","target":"san7","value":1},{"source":"key0","target":"san8","value":1},{"source":"key0","target":"san9","value":1},{"source":"key0","target":"san10","value":1},{"source":"key0","target":"san11","value":1},{"source":"key0","target":"san12","value":1},{"source":"key0","target":"san13","value":1},{"source":"key0","target":"san14","value":1},{"source":"key0","target":"san15","value":1},{"source":"key0","target":"san16","value":1},{"source":"key0","target":"san17","value":1},{"source":"key0","target":"san18","value":1},{"source":"key0","target":"san19","value":1},{"source":"key0","target":"san20","value":1},{"source":"key0","target":"san21","value":1},{"source":"key0","target":"san22","value":1},{"source":"key0","target":"san23","value":1},{"source":"key0","target":"san24","value":1},{"source":"key0","target":"san25","value":1},{"source":"key0","target":"san26","value":1},{"source":"key0","target":"san27","value":1},{"source":"key0","target":"san28","value":1},{"source":"key0","target":"san29","value":1},{"source":"key0","target":"san30","value":1},{"source":"key0","target":"san31","value":1},{"source":"key0","target":"san32","value":1},{"source":"key0","target":"san33","value":1},{"source":"key0","target":"san34","value":1},{"source":"key0","target":"san35","value":1},{"source":"key0","target":"san36","value":1},{"source":"key0","target":"san37","value":1},{"source":"key0","target":"san38","value":1},{"source":"key0","target":"san39","value":1},{"source":"key0","target":"san40","value":1},{"source":"key0","target":"san41","value":1},{"source":"key0","target":"san42","value":1},{"source":"key0","target":"san43","value":1},{"source":"key0","target":"san44","value":1},{"source":"key0","target":"san46","value":1},{"source":"key0","target":"san47","value":1},{"source":"key0","target":"san48","value":1},{"source":"key0","target":"san49","value":1},{"source":"key0","target":"san50","value":1},{"source":"key0","target":"san51","value":1},{"source":"key0","target":"san52","value":1},{"source":"key0","target":"san53","value":1},{"source":"key0","target":"san54","value":1},{"source":"key0","target":"san55","value":1},{"source":"key0","target":"san56","value":1},{"source":"key0","target":"san57","value":1},{"source":"key0","target":"san58","value":1},{"source":"key0","target":"san59","value":1},{"source":"key0","target":"san60","value":1},{"source":"key0","target":"san61","value":1},{"source":"key0","target":"san62","value":1},{"source":"key0","target":"san63","value":1},{"source":"key0","target":"san65","value":1},{"source":"key0","target":"san67","value":1},{"source":"key0","target":"san68","value":1},{"source":"key0","target":"san69","value":1},{"source":"key0","target":"san70","value":1},{"source":"key0","target":"san71","value":1},{"source":"key0","target":"san72","value":1},{"source":"key0","target":"san73","value":1},{"source":"key0","target":"san74","value":1},{"source":"key0","target":"san75","value":1},{"source":"key0","target":"san76","value":1},{"source":"key0","target":"san77","value":1},{"source":"key0","target":"san79","value":1},{"source":"key0","target":"san80","value":1},{"source":"key0","target":"san81","value":1},{"source":"key0","target":"san82","value":1},{"source":"key0","target":"san83","value":1},{"source":"key0","target":"san84","value":1},{"source":"key0","target":"san85","value":1},{"source":"key0","target":"san86","value":1},{"source":"key0","target":"san87","value":1},{"source":"key0","target":"san88","value":1},{"source":"key0","target":"san89","value":1},{"source":"key0","target":"san90","value":1},{"source":"key0","target":"san91","value":1},{"source":"key0","target":"san92","value":1},{"source":"key0","target":"san93","value":1},{"source":"key0","target":"san94","value":1},{"source":"key0","target":"san95","value":1},{"source":"key0","target":"san96","value":1},{"source":"key0","target":"san97","value":1},{"source":"key0","target":"san98","value":1},{"source":"key0","target":"san99","value":1},{"source":"key0","target":"san100","value":1},{"source":"key0","target":"san101","value":1},{"source":"key0","target":"san102","value":1},{"source":"key0","target":"san103","value":1},{"source":"key0","target":"san105","value":1},{"source":"key0","target":"san106","value":1},{"source":"key0","target":"san107","value":1},{"source":"key0","target":"san108","value":1},{"source":"key0","target":"san109","value":1},{"source":"key0","target":"san110","value":1},{"source":"key0","target":"san111","value":1},{"source":"key0","target":"san112","value":1},{"source":"key0","target":"san113","value":1},{"source":"key0","target":"san114","value":1},{"source":"key0","target":"san115","value":1},{"source":"key0","target":"san116","value":1},{"source":"key0","target":"san117","value":1},{"source":"key0","target":"san119","value":1},{"source":"key0","target":"san120","value":1},{"source":"key0","target":"san121","value":1},{"source":"key0","target":"san123","value":1},{"source":"key0","target":"san124","value":1},{"source":"key0","target":"san125","value":1},{"source":"key0","target":"san126","value":1},{"source":"key0","target":"san127","value":1},{"source":"key0","target":"san128","value":1},{"source":"key0","target":"san129","value":1},{"source":"key0","target":"san130","value":1},{"source":"key0","target":"san134","value":1},{"source":"key0","target":"san135","value":1},{"source":"key0","target":"san136","value":1},{"source":"key0","target":"san137","value":1},{"source":"key0","target":"san138","value":1},{"source":"key0","target":"san139","value":1},{"source":"key0","target":"san140","value":1},{"source":"key0","target":"san141","value":1},{"source":"key0","target":"san142","value":1},{"source":"key0","target":"san143","value":1},{"source":"key0","target":"san144","value":1},{"source":"key0","target":"san146","value":1},{"source":"key0","target":"san147","value":1},{"source":"key0","target":"san148","value":1},{"source":"key0","target":"san149","value":1},{"source":"key0","target":"san150","value":1},{"source":"key0","target":"san151","value":1},{"source":"key0","target":"san152","value":1},{"source":"key0","target":"san153","value":1},{"source":"key0","target":"san154","value":1},{"source":"key0","target":"san155","value":1},{"source":"key0","target":"san156","value":1},{"source":"key0","target":"san157","value":1},{"source":"key0","target":"san158","value":1},{"source":"key0","target":"san159","value":1},{"source":"key0","target":"san160","value":1},{"source":"key0","target":"san161","value":1},{"source":"key0","target":"san162","value":1},{"source":"key0","target":"san163","value":1},{"source":"key0","target":"san164","value":1},{"source":"key0","target":"san165","value":1},{"source":"key0","target":"san166","value":1},{"source":"key0","target":"san169","value":1},{"source":"key0","target":"san170","value":1},{"source":"key0","target":"san171","value":1},{"source":"key0","target":"san172","value":1},{"source":"key0","target":"san173","value":1},{"source":"key0","target":"san174","value":1},{"source":"key0","target":"san175","value":1},{"source":"key0","target":"san176","value":1},{"source":"key0","target":"san177","value":1},{"source":"key0","target":"san178","value":1},{"source":"key0","target":"san179","value":1},{"source":"key0","target":"san180","value":1},{"source":"key0","target":"san181","value":1},{"source":"key0","target":"san182","value":1},{"source":"key0","target":"san183","value":1},{"source":"key0","target":"san184","value":1},{"source":"key0","target":"san185","value":1},{"source":"key0","target":"san186","value":1},{"source":"key0","target":"san187","value":1},{"source":"key0","target":"san188","value":1},{"source":"key0","target":"san189","value":1},{"source":"key0","target":"san190","value":1},{"source":"key0","target":"san191","value":1},{"source":"key0","target":"san192","value":1},{"source":"key0","target":"san194","value":1},{"source":"key0","target":"san195","value":1},{"source":"key0","target":"san196","value":1},{"source":"key0","target":"san197","value":1},{"source":"key0","target":"san198","value":1},{"source":"key0","target":"san199","value":1},{"source":"key0","target":"san200","value":1},{"source":"key0","target":"san202","value":1},{"source":"key0","target":"san203","value":1},{"source":"key0","target":"san204","value":1},{"source":"key0","target":"san205","value":1},{"source":"key0","target":"san206","value":1},{"source":"key0","target":"san207","value":1},{"source":"key0","target":"san208","value":1},{"source":"key0","target":"san209","value":1},{"source":"key0","target":"san210","value":1},{"source":"key0","target":"san211","value":1},{"source":"key0","target":"san212","value":1},{"source":"key0","target":"san213","value":1},{"source":"key0","target":"san214","value":1},{"source":"key0","target":"san215","value":1},{"source":"key0","target":"san216","value":1},{"source":"key0","target":"san217","value":1},{"source":"key0","target":"san218","value":1},{"source":"key0","target":"san219","value":1},{"source":"key0","target":"san220","value":1},{"source":"key0","target":"san221","value":1},{"source":"key0","target":"san222","value":1},{"source":"key0","target":"san224","value":1},{"source":"key0","target":"san225","value":1},{"source":"key0","target":"san226","value":1},{"source":"key0","target":"san227","value":1},{"source":"key0","target":"san228","value":1},{"source":"key0","target":"san229","value":1},{"source":"key0","target":"san230","value":1},{"source":"key0","target":"san231","value":1},{"source":"key0","target":"san232","value":1},{"source":"key0","target":"san233","value":1},{"source":"key0","target":"san234","value":1},{"source":"key4","target":"san3","value":1},{"source":"key4","target":"san44","value":1},{"source":"key4","target":"san50","value":1},{"source":"key4","target":"san98","value":1},{"source":"key4","target":"san124","value":1},{"source":"key4","target":"san167","value":1},{"source":"key4","target":"san203","value":1},{"source":"key5","target":"san4","value":1},{"source":"key5","target":"san67","value":1},{"source":"key5","target":"san92","value":1},{"source":"key5","target":"san117","value":1},{"source":"key5","target":"san141","value":1},{"source":"key5","target":"san142","value":1},{"source":"key5","target":"san143","value":1},{"source":"key5","target":"san165","value":1},{"source":"key5","target":"san171","value":1},{"source":"key5","target":"san178","value":1},{"source":"key5","target":"san179","value":1},{"source":"key5","target":"san187","value":1},{"source":"key7","target":"san5","value":1},{"source":"key7","target":"san9","value":1},{"source":"key7","target":"san30","value":1},{"source":"key7","target":"san64","value":1},{"source":"key7","target":"san99","value":1},{"source":"key7","target":"san146","value":1},{"source":"key7","target":"san167","value":1},{"source":"key7","target":"san177","value":1},{"source":"key7","target":"san192","value":1},{"source":"key7","target":"san207","value":1},{"source":"key7","target":"san216","value":1},{"source":"key7","target":"san233","value":1},{"source":"key9","target":"san7","value":1},{"source":"key9","target":"san57","value":1},{"source":"key9","target":"san59","value":1},{"source":"key9","target":"san79","value":1},{"source":"key9","target":"san80","value":1},{"source":"key9","target":"san81","value":1},{"source":"key9","target":"san82","value":1},{"source":"key9","target":"san83","value":1},{"source":"key9","target":"san84","value":1},{"source":"key9","target":"san155","value":1},{"source":"key9","target":"san157","value":1},{"source":"key9","target":"san175","value":1},{"source":"key9","target":"san180","value":1},{"source":"key9","target":"san181","value":1},{"source":"key9","target":"san183","value":1},{"source":"key9","target":"san184","value":1},{"source":"key9","target":"san185","value":1},{"source":"key9","target":"san186","value":1},{"source":"key9","target":"san190","value":1},{"source":"key9","target":"san199","value":1},{"source":"key11","target":"san22","value":1},{"source":"key11","target":"san69","value":1},{"source":"key11","target":"san163","value":1},{"source":"key11","target":"san189","value":1},{"source":"key11","target":"san204","value":1},{"source":"key11","target":"san222","value":1},{"source":"key12","target":"san22","value":1},{"source":"key13","target":"san22","value":1},{"source":"key13","target":"san46","value":1},{"source":"key13","target":"san52","value":1},{"source":"key13","target":"san106","value":1},{"source":"key13","target":"san123","value":1},{"source":"key13","target":"san176","value":1},{"source":"key14","target":"san32","value":1},{"source":"key16","target":"san35","value":1},{"source":"key16","target":"san71","value":1},{"source":"key16","target":"san167","value":1},{"source":"key18","target":"san43","value":1},{"source":"key18","target":"san84","value":1},{"source":"key21","target":"san81","value":1},{"source":"key23","target":"san91","value":1},{"source":"key23","target":"san95","value":1},{"source":"key23","target":"san157","value":1},{"source":"key23","target":"san195","value":1},{"source":"key23","target":"san207","value":1},{"source":"key23","target":"san210","value":1},{"source":"key23","target":"san213","value":1},{"source":"key23","target":"san214","value":1},{"source":"key23","target":"san215","value":1},{"source":"key23","target":"san227","value":1},{"source":"key23","target":"san230","value":1},{"source":"key23","target":"san231","value":1},{"source":"key23","target":"san232","value":1},{"source":"key26","target":"san98","value":1},{"source":"key27","target":"san99","value":1},{"source":"key27","target":"san196","value":1},{"source":"key28","target":"san104","value":1},{"source":"key28","target":"san166","value":1},{"source":"key33","target":"san122","value":1},{"source":"key35","target":"san144","value":1},{"source":"key35","target":"san166","value":1},{"source":"key35","target":"san193","value":1},{"source":"key35","target":"san197","value":1},{"source":"key35","target":"san198","value":1},{"source":"key35","target":"san201","value":1},{"source":"key35","target":"san211","value":1},{"source":"key35","target":"san217","value":1},{"source":"key35","target":"san220","value":1},{"source":"key35","target":"san228","value":1},{"source":"key35","target":"san234","value":1},{"source":"key36","target":"san144","value":1},{"source":"key36","target":"san193","value":1},{"source":"key36","target":"san198","value":1},{"source":"key36","target":"san201","value":1},{"source":"key36","target":"san211","value":1},{"source":"key36","target":"san217","value":1},{"source":"key36","target":"san220","value":1},{"source":"key36","target":"san228","value":1},{"source":"key36","target":"san234","value":1},{"source":"key37","target":"san153","value":1},{"source":"key39","target":"san167","value":1},{"source":"key40","target":"san167","value":1},{"source":"key42","target":"san174","value":1},{"source":"key45","target":"san203","value":1},{"source":"tag1","target":"key4","value":1},{"source":"tag1","target":"key5","value":1},{"source":"tag1","target":"key7","value":1},{"source":"tag1","target":"key11","value":1},{"source":"tag1","target":"key16","value":1},{"source":"tag1","target":"key26","value":1},{"source":"tag1","target":"key27","value":1},{"source":"tag1","target":"key33","value":1},{"source":"tag1","target":"key35","value":1},{"source":"tag1","target":"key36","value":1},{"source":"tag1","target":"key42","value":1},{"source":"tag1","target":"key45","value":1},{"source":"tag2","target":"key5","value":1},{"source":"tag2","target":"key11","value":1},{"source":"tag2","target":"key35","value":1},{"source":"tag2","target":"key36","value":1},{"source":"tag2","target":"key42","value":1},{"source":"tag3","target":"key4","value":1},{"source":"tag3","target":"key7","value":1},{"source":"tag3","target":"key26","value":1},{"source":"tag3","target":"key27","value":1},{"source":"tag3","target":"key33","value":1},{"source":"tag3","target":"key45","value":1},{"source":"tag6","target":"key4","value":1},{"source":"tag6","target":"key5","value":1},{"source":"tag6","target":"key7","value":1},{"source":"tag6","target":"key11","value":1},{"source":"tag6","target":"key26","value":1},{"source":"tag6","target":"key27","value":1},{"source":"tag6","target":"key33","value":1},{"source":"tag6","target":"key35","value":1},{"source":"tag6","target":"key36","value":1},{"source":"tag6","target":"key42","value":1},{"source":"tag6","target":"key45","value":1},{"source":"tag8","target":"key0","value":1},{"source":"tag8","target":"key4","value":1},{"source":"tag8","target":"key5","value":1},{"source":"tag8","target":"key7","value":1},{"source":"tag8","target":"key11","value":1},{"source":"tag8","target":"key14","value":1},{"source":"tag8","target":"key16","value":1},{"source":"tag8","target":"key26","value":1},{"source":"tag8","target":"key27","value":1},{"source":"tag8","target":"key28","value":1},{"source":"tag8","target":"key33","value":1},{"source":"tag8","target":"key35","value":1},{"source":"tag8","target":"key36","value":1},{"source":"tag8","target":"key42","value":1},{"source":"tag8","target":"key45","value":1},{"source":"tag10","target":"key5","value":1},{"source":"tag10","target":"key11","value":1},{"source":"tag10","target":"key35","value":1},{"source":"tag10","target":"key36","value":1},{"source":"tag10","target":"key42","value":1},{"source":"tag15","target":"key0","value":1},{"source":"tag15","target":"key5","value":1},{"source":"tag15","target":"key11","value":1},{"source":"tag15","target":"key14","value":1},{"source":"tag15","target":"key28","value":1},{"source":"tag15","target":"key35","value":1},{"source":"tag15","target":"key36","value":1},{"source":"tag15","target":"key42","value":1},{"source":"tag17","target":"key0","value":1},{"source":"tag17","target":"key4","value":1},{"source":"tag17","target":"key5","value":1},{"source":"tag17","target":"key7","value":1},{"source":"tag17","target":"key11","value":1},{"source":"tag17","target":"key14","value":1},{"source":"tag17","target":"key16","value":1},{"source":"tag17","target":"key26","value":1},{"source":"tag17","target":"key27","value":1},{"source":"tag17","target":"key28","value":1},{"source":"tag17","target":"key33","value":1},{"source":"tag17","target":"key35","value":1},{"source":"tag17","target":"key36","value":1},{"source":"tag17","target":"key42","value":1},{"source":"tag17","target":"key45","value":1},{"source":"tag19","target":"key0","value":1},{"source":"tag19","target":"key4","value":1},{"source":"tag19","target":"key5","value":1},{"source":"tag19","target":"key7","value":1},{"source":"tag19","target":"key11","value":1},{"source":"tag19","target":"key14","value":1},{"source":"tag19","target":"key26","value":1},{"source":"tag19","target":"key27","value":1},{"source":"tag19","target":"key28","value":1},{"source":"tag19","target":"key33","value":1},{"source":"tag19","target":"key35","value":1},{"source":"tag19","target":"key36","value":1},{"source":"tag19","target":"key42","value":1},{"source":"tag19","target":"key45","value":1},{"source":"tag20","target":"key0","value":1},{"source":"tag20","target":"key4","value":1},{"source":"tag20","target":"key7","value":1},{"source":"tag20","target":"key14","value":1},{"source":"tag20","target":"key26","value":1},{"source":"tag20","target":"key28","value":1},{"source":"tag20","target":"key33","value":1},{"source":"tag22","target":"key0","value":1},{"source":"tag22","target":"key7","value":1},{"source":"tag22","target":"key14","value":1},{"source":"tag22","target":"key18","value":1},{"source":"tag22","target":"key21","value":1},{"source":"tag22","target":"key28","value":1},{"source":"tag24","target":"key4","value":1},{"source":"tag24","target":"key26","value":1},{"source":"tag24","target":"key33","value":1},{"source":"tag25","target":"key0","value":1},{"source":"tag25","target":"key4","value":1},{"source":"tag25","target":"key7","value":1},{"source":"tag25","target":"key14","value":1},{"source":"tag25","target":"key18","value":1},{"source":"tag25","target":"key26","value":1},{"source":"tag25","target":"key27","value":1},{"source":"tag25","target":"key28","value":1},{"source":"tag25","target":"key33","value":1},{"source":"tag25","target":"key45","value":1},{"source":"tag29","target":"key0","value":1},{"source":"tag29","target":"key4","value":1},{"source":"tag29","target":"key7","value":1},{"source":"tag29","target":"key14","value":1},{"source":"tag29","target":"key26","value":1},{"source":"tag29","target":"key27","value":1},{"source":"tag29","target":"key28","value":1},{"source":"tag29","target":"key33","value":1},{"source":"tag29","target":"key45","value":1},{"source":"tag30","target":"key0","value":1},{"source":"tag30","target":"key5","value":1},{"source":"tag30","target":"key11","value":1},{"source":"tag30","target":"key14","value":1},{"source":"tag30","target":"key28","value":1},{"source":"tag30","target":"key35","value":1},{"source":"tag30","target":"key36","value":1},{"source":"tag30","target":"key42","value":1},{"source":"tag31","target":"key0","value":1},{"source":"tag31","target":"key4","value":1},{"source":"tag31","target":"key5","value":1},{"source":"tag31","target":"key7","value":1},{"source":"tag31","target":"key11","value":1},{"source":"tag31","target":"key14","value":1},{"source":"tag31","target":"key26","value":1},{"source":"tag31","target":"key27","value":1},{"source":"tag31","target":"key28","value":1},{"source":"tag31","target":"key33","value":1},{"source":"tag31","target":"key35","value":1},{"source":"tag31","target":"key36","value":1},{"source":"tag31","target":"key42","value":1},{"source":"tag31","target":"key45","value":1},{"source":"tag32","target":"key0","value":1},{"source":"tag32","target":"key5","value":1},{"source":"tag32","target":"key11","value":1},{"source":"tag32","target":"key14","value":1},{"source":"tag32","target":"key28","value":1},{"source":"tag32","target":"key35","value":1},{"source":"tag32","target":"key36","value":1},{"source":"tag32","target":"key42","value":1},{"source":"tag34","target":"key4","value":1},{"source":"tag34","target":"key5","value":1},{"source":"tag34","target":"key7","value":1},{"source":"tag34","target":"key11","value":1},{"source":"tag34","target":"key16","value":1},{"source":"tag34","target":"key26","value":1},{"source":"tag34","target":"key27","value":1},{"source":"tag34","target":"key33","value":1},{"source":"tag34","target":"key35","value":1},{"source":"tag34","target":"key36","value":1},{"source":"tag34","target":"key45","value":1},{"source":"tag38","target":"key4","value":1},{"source":"tag38","target":"key7","value":1},{"source":"tag38","target":"key11","value":1},{"source":"tag38","target":"key16","value":1},{"source":"tag38","target":"key26","value":1},{"source":"tag38","target":"key27","value":1},{"source":"tag38","target":"key33","value":1},{"source":"tag38","target":"key35","value":1},{"source":"tag38","target":"key45","value":1},{"source":"tag41","target":"key0","value":1},{"source":"tag41","target":"key4","value":1},{"source":"tag41","target":"key5","value":1},{"source":"tag41","target":"key7","value":1},{"source":"tag41","target":"key11","value":1},{"source":"tag41","target":"key14","value":1},{"source":"tag41","target":"key26","value":1},{"source":"tag41","target":"key28","value":1},{"source":"tag41","target":"key33","value":1},{"source":"tag41","target":"key35","value":1},{"source":"tag41","target":"key36","value":1},{"source":"tag41","target":"key42","value":1},{"source":"tag43","target":"key4","value":1},{"source":"tag43","target":"key7","value":1},{"source":"tag43","target":"key26","value":1},{"source":"tag43","target":"key33","value":1},{"source":"tag44","target":"key4","value":1},{"source":"tag44","target":"key26","value":1},{"source":"tag44","target":"key33","value":1},{"source":"tag46","target":"key7","value":1},{"source":"tag46","target":"key26","value":1},{"source":"tag46","target":"key27","value":1},{"source":"tag46","target":"key45","value":1},{"source":"news","target":"tag1","value":1},{"source":"news","target":"tag2","value":1},{"source":"news","target":"tag3","value":1},{"source":"news","target":"tag6","value":1},{"source":"news","target":"tag8","value":1},{"source":"news","target":"tag10","value":1},{"source":"news","target":"tag15","value":1},{"source":"news","target":"tag17","value":1},{"source":"news","target":"tag19","value":1},{"source":"news","target":"tag20","value":1},{"source":"news","target":"tag22","value":1},{"source":"news","target":"tag24","value":1},{"source":"news","target":"tag25","value":1},{"source":"news","target":"tag29","value":1},{"source":"news","target":"tag30","value":1},{"source":"news","target":"tag31","value":1},{"source":"news","target":"tag32","value":1},{"source":"news","target":"tag34","value":1},{"source":"news","target":"tag38","value":1},{"source":"news","target":"tag41","value":1},{"source":"news","target":"tag43","value":1},{"source":"news","target":"tag44","value":1},{"source":"news","target":"tag46","value":1}]};
        // 不需要“”括起来，但是最后要用分号；


        //***开始解析网页

        //成功在page之外获取到页面元素内容，发现百度的下一页，就是
        let elements = Array.from(document.querySelectorAll(".c-container" && ".result"));
        // console.log(elements);
        //读取数组里内容map为value
        let dataPage = elements.map(element => {
            // console.log(element);

            //搜索到文章的标题
            let title = element.querySelector(".t");
            (title !== null) ? title = title.innerText : title = null;

            // console.log(title);

            //搜索到文章的url
            let url = element.querySelector(".t > a");
            (url !== null) ? url = url.href : url = null;

            // console.log(url);

            //搜索到的文章的来源网站
            let siteName = element.querySelector(".t > a");
            (siteName !== null) ? siteName = siteName.innerText.split(" - ")[1] : siteName = null;

            // console.log(siteName);

            //搜索到的文章的发布日期
            // let time = element.querySelector(".c-abstract>.newTimeFactor_before_abs"); //之前的query
            let time = element.querySelector("div> div:nth-child(1) > div:nth-child(3) > div > span.c-color-gray2");
            (time !== null) ? time = time.innerText : time = null; //google几天前时间可以计算一下

            // console.log(time);

            //搜索到的文章的摘要
            let abstract = element.querySelector("div> div:nth-child(1) > div:nth-child(3) > div > span.content-right_8Zs40");
            (abstract !== null) ? abstract = abstract.innerText : abstract = null;

            // console.log(abstract);

            // 搜索到文章的关键词(relaited to经过百度分词的搜索框内容)
            let keyWords = Array.from(element.querySelectorAll("em"));
            (keyWords !== null) ? keyWords = keyWords.map(item => {
                return item.innerText
            }) : keyWords = null;
            // console.log(keyWords);


            let elementEach = {
                title,
                url,
                siteName,
                time,
                abstract,
                keyWords
            };



            console.log(elementEach);
            return elementEach

        });

        console.log(dataPage);
        // let dataPageString = JSON.stringify(resultPages);
        // let dataPage = JSON.parse(dataPageString);

        // console.log("dataPage:"+dataPage);

        let keyWords = []
        for (let i in dataPage) {
            let temp = dataPage[i].keyWords;
            console.log("temp:"+temp);
            keyWords = keyWords.concat(temp)
        }
        let keyWordsSet = Array.from(new Set(keyWords))


        //将nodes,links写成json,到d3里面读
        // 尝试声明一个类

        let nodes = []
        let links = []
        let id = 0

        //4,san,id=40000,49999
        // san
        //   id
        //     自增长
        //   name
        //     dataPage.title
        //   value
        //     id
        // dataPage.abstract
        //   origin
        //     baidu
        //   time
        //     dataPage.time
        //       可以控制颜色
        //       year
        //   url
        //     dataPage.url
        //   links
        //     source:
        //     link
        //      都是目的地之前都指向了
        let sanidstart = id;
        let sanNode = []

        for (let j = 0; j < dataPage.length; j++) {
            sanNode.push(
                {
                    category: 4,
                    id: "san" + j,
                    name: dataPage[j].title,
                    value: dataPage[j].abstract,
                    origin: "baidu.com",
                    time: dataPage[j].time,
                    //    提取前四个数字做年.replace(/[^0-9]/ig,"").substr(0,4)
                    year: (dataPage[j].time !== null && (dataPage[j].time).replace(/[^0-9]/ig, "") !== "") ? (dataPage[j].time).replace(/[^0-9]/ig, "").substr(0, 4) : null,
                    url: dataPage[j].url,
                    //为了前面能找到,再加一条,也可以用这个循环,就少了一个!,这样资料全一些
                    keyWords: dataPage[j].keyWords,
                    type: "san",
                })
        }
        ;

        let keyidstart = id
        //3,key,id=30000-399993
        //   key
        //     id
        //       自增长
        //     name
        //       四个字以下的keywords
        //     value
        //       id
        //     origin
        //       null
        //     time
        //       null
        //     url
        //       null
        //     links
        //       source:本身
        //       target:
        //         关联的san
        let keyNode = []
        for (let i = 0; i < keyWordsSet.length; i++) {

            if (keyWordsSet[i].length <= 4) {
                keyNode.push({
                    category: 3,
                    id: "key" + i,
                    name: keyWordsSet[i],
                    value: 30000 + i + "",
                    type: "key",
                })
                //     !!! link 如果 keyNode.name 在dataPage.keywords li indexof 就连接(先写san)
                //    for (k)
                for (let j = 0; j < sanNode.length; j++) {
                    //keywords是数组,不知道行不行,可以
                    if (sanNode[j].keyWords.indexOf(keyWordsSet[i]) !== -1) {
                        links.push({
                            source: "key" + i,
                            target: "san" + j,
                            value: 1

                        })
                    }
                }


            }
        }

        let tagid = id
        //2,tag,id=20000-29999,
        let tagNode = [];
        for (let i = 0; i < keyWordsSet.length; i++) {
            if (keyWordsSet[i].length > 4) {
                tagNode.push({
                    category: 2,
                    id: "tag" + i,
                    type: "tag",
                    name: keyWordsSet[i],
                    value: id,
                })

                for (let j = 0; j < keyNode.length; j++) {
                    //如果tagNode.name包含了keyNode.name(indexof),就连一条线
                    if (keyWordsSet[i].indexOf(keyNode[j].name) !== -1) {
                        links.push({
                            source: "tag" + i,
                            target: keyNode[j].id,
                            value: 1
                        }
                                  )
                    }
                }
            }

        }


        //1,id=10000,不能用10000+"",,只能用i+"".直接"10000"就好了
        let newsNode = {
            category: 1,
            id: "news",
            //先用searchtext代替
            name: "searchText",
            value: id,
            type: "news"
        }

        for (let i = 0; i < tagNode.length; i++) {
            links.push({
                source: "news",
                target: tagNode[i].id,
                value: 1
            });


        }


        //    合并4个[],用concat(),
        nodes = nodes.concat(newsNode).concat(tagNode).concat(keyNode).concat(sanNode);
        // console.log("nodes", nodes, "links", links);
        let data = { 'nodes': nodes, 'links': links };
        console.log(data)






        graph = data;
        console.log(data);
        //d3 mapping data to html,make line with = 1
        //    links
        var link = svg.append("g")

        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke-width", function (d) {
            return d.value;
        });
        //   nodes
        var node = svg.append("g")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        //        试着给每种type加一个class,要放在数据读取之后
        .attr("class", function (d) {
            // return "nodes";
            return "nodes " + d.type;
        })
        .attr("r", function (d) {
            //    make radius of node circle
            return sizes[d.category - 1];                    // return r;
        })
        .attr("fill", function (d) {
            //    配合现在category从1开始,今后可以重新设计一下category make color of node circle,也可以加到后面,统一修改
            console.log(d.category);
            return colors[d.category - 1];

        })
        .attr("stroke", "none")
        .attr("name", function (d) {
            //    make text of node
            return d.name;
        })

        // set drag event
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

        //固定中心文章位置,用class来控制
        //固定中心文章位置,fx可以设置哈哈,或者大面积的可以用tick,详见https://stackoverflow.com/questions/10392505/fix-node-position-in-d3-force-directed-layout,实验证明,还可以用type属性来控制fx,fy

        svg.select(".news")
            .attr("fx", function (d) {

            return d.fx = width / 2;
        })
            .attr("fy", function (d) {
            return d.fy = height / 2;
        })
        // .attr("r", function (d) {
        //     return 2 * r;
        // });
        // .call(force.drag);

        var screenratio = width / height;

        /**
             * 获取坐标数组
             * r 圆的半径
             * ratio 压缩比例
             * size 等分值 需要将圆划分为多少份d3.selectAll(".san")._groups[0].length
             */
        function getXYS(r, ratio, type) {
            var xys = [];
            var typeString = "." + type;
            var size = d3.selectAll(typeString.toString())._groups[0].length
            var r1 = r1 * size * ratio;
            for (var i = 0; i < size; i++) {
                //圆心坐标
                var x = width / 2, y = height / 2;
                // 计算弧度
                var rad = i * 2 * Math.PI / size;

                // r*Math.cos(rad) 弧线的终点相对dot的水平偏移
                // r*Math.sin(rad) 弧线的终点相对dot的垂直偏移
                // compressionRatio 垂直压缩比例
                // 定义了x_,y_
                let x_ = ratio * r * Math.sin(rad) + x;
                let y_ = -r * Math.cos(rad) + y;
                xys.push({
                    px: x_,
                    py: y_
                });
            }

            return xys;
        }

        //暂且将各自的个数(tag和key)用links.length代替,R=输入的r*size(个数)
        var tagXys = getXYS(sizes[2], 1, "tag"); //段落

        var keyXys = getXYS(sizes[3], width / height, "key"); //关键字

        //固定段落位置
        svg.selectAll(".tag")
            .attr("type", function (d, i) {
            var obj = tagXys[i]
            d.fx = obj.px;
            d.fy = obj.py;

        });

        //固定关键字位置
        svg.selectAll(".key").attr("type", function (d, i) {
            var obj = keyXys[i]
            d.fx = obj.px;
            d.fy = obj.py;
        });

        //san文章
        // svg.selectAll(".san")
        // .attr("r", rSan);


        //    显示所有的文本...
        var text = svg.append("g")
        .attr("class", "texts")
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text").attr("font-size", function (d) {
            // return d.size;
            // 文字大小应该是以看的见为宗旨
            return sizes[d.category - 1];
        })
        .attr("fill", function (d) {
            // return "red";
            return colors[d.category - 1];
        })
        .attr("name", function (d) {
            return d.name;
        })
        .text(function (d) {
            return d.name;
        })
        .attr("text-anchor", "middle")
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended)
             );

        //圆增加title...
        node.append("title").text(function (d) {
            return d.name;
        })
        //    simulation里面的ticked初始化生成图形
        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);
        simulation.force("link")
            .links(graph.links);

        // ticked()函数确定link的起始点坐标(source(x1,y1),target(x2,y2)),node确定中心点(cx,cy),文本通过translate平移变化
        function ticked() {
            link
                .attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                return d.source.y;
            })
                .attr("x2", function (d) {
                return d.target.x;
            })
                .attr("y2", function (d) {
                return d.target.y;
            })

            node
                .attr("cx", function (d) {
                return d.x;
            })
                .attr("cy", function (d) {
                return d.y;
            })
            text.attr('transform', function (d) {
                // return 'translate(' + d.x + ',' + (d.y + d.size / 2) + ')';
                return 'translate(' + d.x + ',' + (d.y + sizes[d.category - 1] / 2) + ')';
            });
        }

        //    未完待续... xampp for cross origin requests

    });
    //added a var
    var dragging = false;

    // dragXXX related
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        dragging = true;

    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        //            alphaTarget(num)是啥意思啊,d里面的fx,fy是下一刻的x,y吗?
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        dragging = false;
    }

    $('#mode span').click(function (event) {
        //     //    span all set to inactive state
        //     $('#mode span').removeClass('active');
        //     //    the clicked span activaed
        //     $(this).addClass('active');
        //     //    text hide nodes display
        //     if ($(this).text() === '节点') {
        //         $('.texts' && 'text').hide();
        //         $('.nodes' && 'circle').show();
        //     } else {
        //         $('texts' && 'text').show();
        //         $('.nodes' && 'circle').hide();
        //     }
        // })



        //搜索框中输入内容则响应该事件
        // keyup按键敲击响应event
        $('#search1 input').keyup(function (event) {
            console.log($(this).val());
            if ($(this).val() == '') {
                d3.select('#svg .texts').selectAll('text').attr('class', '');
                d3.select('#svg .nodes').selectAll('circle').attr('class', '');
                d3.select('#svg .links').selectAll('line').attr('class', '');
            } else {
                var name = $(this).val();
                d3.select('#svg .nodes').selectAll('circle').attr('class', function (d) {
                    if (d.id.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
                        return '';
                    } else {
                        return 'inactive';
                    }
                });
                d3.select('#svg .texts').selectAll('text').attr('class', function (d) {
                    if (d.id.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
                        return '';
                    } else {
                        return 'inactive';
                    }
                });
                d3.select("#svg .links").selectAll('line').attr('class', function (d) {
                    return 'inactive';
                });
            }
        });
    });
});