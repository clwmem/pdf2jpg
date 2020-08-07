import mergeImg from 'merge-img';
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const moment = require('moment');

const EMPTY_MD5 = '38cf60883465598a278011fac087d643';

const inputDir = path.join(__dirname, '..','input');
const outPutDir = path.join(__dirname, '..','output', );

fs.mkdirSync(inputDir);
fs.mkdirSync(outPutDir);
fs.mkdirSync(path.join(outPutDir, moment().format('YYYYMMDD_HHmmssms')));

const pdf2jpg = async(filename) => {

  return new Promise((resolve, reject) => {

    const inputFile = path.join(inputDir, filename);
    const outputFileDir = path.join(outPutDir, filename.substr(0, filename.length - 4));

    const pdf2img = require('pdf2img');
    pdf2img.setOptions({
      type: 'jpg',                                // png or jpg, default jpg
      size: 1024,                                 // default 1024
      density: 600,                               // default 600
      outputdir: outputFileDir,                       // output folder, default null (if null given, then it will create folder name same as file name)
      outputname: filename,                    // output file name, dafault null (if null given, then it will create image name same as input name)
      page: null,                                 // convert selected page, default null (if null given, then it will convert all pages)
      quality: 100                                // jpg compression quality, default: 100
    });
  
    pdf2img.convert(inputFile, function (err, info) {
      if (err) reject(err);
      else resolve(info);
    });
  });
};

(async ()=> {
  try {
    const dirList = fs.readdirSync(inputDir);

    for (const file of dirList) {
      const ignoreExtensionFileName = file.substr(0, file.length - 4);

      console.log('start', ignoreExtensionFileName);
      console.time(ignoreExtensionFileName);

      await pdf2jpg(file);

      const outputFileDir = path.join(outPutDir, ignoreExtensionFileName);
      const outputMergeFile = path.join(outPutDir, ignoreExtensionFileName + '_merge.jpg');

      const outputFileList = fs.readdirSync(outputFileDir).map(file => {
        const filePath = path.join(outputFileDir, file);
        const buffer = fs.readFileSync(filePath);
        return buffer;
      }).filter(buffer => {
        // ignore empty file
        // 38cf60883465598a278011fac087d643  output/Gmail - Google Play 주문 영수증(2019. 3. 22)/Gmail - Google Play 주문 영수증(2019. 3. 22).pdf_3.jpg
        return (md5(buffer) !== EMPTY_MD5);
      });

      const options = {
        direction: true,
      };

      const img = await mergeImg(outputFileList, options);
      await img.write(outputMergeFile);
      console.log('write', outputMergeFile);
      console.timeEnd(ignoreExtensionFileName);
    }

  } catch (error) {
    console.log(error);
  }
})();
