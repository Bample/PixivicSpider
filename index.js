var request = require("request");
var fs = require("fs");
var path = require("path");
const readline = require("readline");

console.log("Pixivic日榜爬虫 仅供学习交流 Made By LiangYin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function mkdir(dirpath, dirname) {
  //判断是否是第一次调用
  if (typeof dirname === "undefined") {
    if (fs.existsSync(dirpath)) {
      return;
    } else {
      mkdir(dirpath, path.dirname(dirpath));
    }
  } else {
    //判断第二个参数是否正常，避免调用时传入错误参数
    if (dirname !== path.dirname(dirpath)) {
      mkdir(dirpath);
      return;
    }
    if (fs.existsSync(dirname)) {
      fs.mkdirSync(dirpath);
    } else {
      mkdir(dirname, path.dirname(dirname));
      fs.mkdirSync(dirpath);
    }
  }
}

function getJsonLength(json) {
  var jsonLength = 0;
  for (var i in json) {
    jsonLength++;
  }
  return jsonLength;
}

function downloadFile(uri, filename, callback) {
  var stream = fs.createWriteStream(filename);
  request({
    url: uri,
    headers: {
      accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      "accept-encoding": "gzip, deflate, br",
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "no-cors",
      "sec-fetch-dest": "image",
      "accept-languag": "zh-CN,zh;q=0.9,en;q=0.8,pl;q=0.7",
      referer: "https://pixivic.com/popSearch",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.30 Safari/537.36 Edg/84.0.522.11",
    },
  })
    .pipe(stream)
    .on("close", callback);
}

rl.question("你要在Pixivic中查找:", (answer) => {
  console.log(`开始下载：${answer}`);

  var options = {
    url:
      "https://api.pixivic.com/illustrations?page=1&keyword=" +
      encodeURI(answer) +
      "&pageSize=100",
    headers: {
      referer: "https://pixivic.com/popSearch",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.30 Safari/537.36 Edg/84.0.522.11",
    },
  };
  mkdir(answer);
  request(options, function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      for (let i = 0; i < getJsonLength(info.data); i++) {
        try {
          var downloadurl = info.data[i].imageUrls[0].original;

          downloadurl = downloadurl.replace(
            /https:\/\/i.pximg.net\//,
            "https://original.img.cheerfun.dev/"
          );
          console.log(downloadurl);
          downloadFile(
            downloadurl,
            "./" + answer + "/" + String(i + 1) + ".png",
            function () {
              console.log("第%d张图片下载完毕", i + 1);
            }
          );
        } catch {
          console.error("Something went wrong, please contact the developer.");
        }
      }
    }
  });
  rl.close();
});
