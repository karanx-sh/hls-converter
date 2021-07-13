const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");

const { remote } = require("electron");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const { dialog, Menu } = remote;

let file;
let prog = 0;
let progBarDiv = document.getElementById("progBarDiv");
let progBar = document.getElementById("progBar");
let saveFilePath;
let fileprefix;

async function getFile() {
  const filePath = await dialog.showOpenDialog({
    filters: [{ name: "Movies", extensions: ["mkv", "avi", "mp4"] }],
    properties: ["openFile"],
    buttonLabel: "Open",
  });
  file = filePath.filePaths[0];
}

function checkProgress() {
  if (prog == 0) {
    progBar.style.width = "30%";
    progBar.innerHTML = "30%";
    prog++;
  } else if (prog == 1) {
    progBar.style.width = "60%";
    progBar.innerHTML = "60%";
    prog++;
  } else if (prog == 2) {
    progBar.style.width = "80%";
    progBar.innerHTML = "680%";
    prog++;
  }

}
function callback() {
  // do something when encoding is done
  fs.writeFile(`${saveFilePath}/${fileprefix}.m3u8`, `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n${fileprefix}360.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=842x480\n${fileprefix}480.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n${fileprefix}720.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1920x1080\n${fileprefix}1080.m3u8`, function (err, data) {
    if (err) {
      return dialog.showErrorBox("Error", "Something Went Wrong!!");
    } else {
      progBar.style.width = "100%";
      progBar.innerHTML = "100%";

      dialog.showMessageBox({
        title: "Completed",
        message: "File is converted successfully",
        type: "info",
      });
    }
  });
}

async function convert() {
  try {
    if (!file || file === null || file === undefined) throw { title: "Input File Empty", message: "Please select input video file" };
    const filePath = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      buttonLabel: "Save",
    });
    if (filePath.filePaths.length === 0) throw { title: "Select Export Folder", message: "Please Select Export Folder" };
    // console.log(`Selected file ${file},${path.basename(file)} & selected Path ${filePath.filePaths[0]}`);
    saveFilePath = filePath.filePaths[0];
    fileprefix = path.parse(path.basename(file).replace(/\s/g, "")).name;
    const filename = file;
    dialog.showMessageBox({
      title: "Process",
      message: "Video Converting....",
      type: "info",
    });
    progBarDiv.style.display = "flex";
    progBar.style.width = "10%";
    progBar.innerHTML = "10%";
    ffmpeg(filename)
      .addOptions([
        //360
        "-profile:v main",
        "-vf scale=w=640:h=360:force_original_aspect_ratio=decrease",
        "-c:a aac",
        "-ar 48000",
        "-b:a 96k",
        "-c:v h264",
        "-crf 20",
        "-g 48",
        "-keyint_min 48",
        "-sc_threshold 0",
        "-b:v 800k",
        "-maxrate 856k",
        "-bufsize 1200k",
        "-hls_time 10",
        `-hls_segment_filename ${saveFilePath}/360%03d.ts`,
        "-hls_playlist_type vod",
        "-f hls",
      ])
      .output(`${saveFilePath}/${fileprefix}360.m3u8`)
      .on("end", checkProgress)
      .run();

    ffmpeg(filename)
      .addOptions([
        //480
        "-profile:v main",
        "-vf scale=w=842:h=480:force_original_aspect_ratio=decrease",
        "-c:a aac",
        "-ar 48000",
        "-b:a 128k",
        "-c:v h264",
        "-crf 20",
        "-g 48",
        "-keyint_min 48",
        "-sc_threshold 0",
        "-b:v 1400k",
        "-maxrate 1498k",
        "-bufsize 2100k",
        "-hls_time 10",
        `-hls_segment_filename ${saveFilePath}/480p%03d.ts`,
        "-hls_playlist_type vod",
        "-f hls",
      ])
      .output(`${saveFilePath}/${fileprefix}480.m3u8`)
      .on("end", checkProgress)
      .run();

    ffmpeg(filename)
      .addOptions([
        //720
        "-profile:v main",
        "-vf scale=w=1280:h=720:force_original_aspect_ratio=decrease",
        "-c:a aac",
        "-ar 48000",
        "-b:a 128k",
        "-c:v h264",
        "-crf 20",
        "-g 48",
        "-keyint_min 48",
        "-sc_threshold 0",
        "-b:v 2800k",
        "-maxrate 2996k",
        "-bufsize 4200k",
        "-hls_time 10",
        `-hls_segment_filename ${saveFilePath}/720p%03d.ts`,
        "-hls_playlist_type vod",
        "-f hls",
      ])
      .output(`${saveFilePath}/${fileprefix}720.m3u8`)
      .on("end", checkProgress)
      .run();

      ffmpeg(filename)
      .addOptions([
        //720
        "-profile:v main",
        "-vf scale=w=1920:h=1080:force_original_aspect_ratio=decrease",
        "-c:a aac",
        "-ar 48000",
        "-b:a 128k",
        "-c:v h264",
        "-crf 20",
        "-g 48",
        "-keyint_min 48",
        "-sc_threshold 0",
        "-b:v 2800k",
        "-maxrate 2996k",
        "-bufsize 4200k",
        "-hls_time 10",
        `-hls_segment_filename ${saveFilePath}/1080p%03d.ts`,
        "-hls_playlist_type vod",
        "-f hls",
      ])
      .output(`${saveFilePath}/${fileprefix}1080.m3u8`)
      .on("end", callback)
      .run();
  } catch (error) {
    console.log(error);
    dialog.showErrorBox(error.title, error.message);
  }
}
