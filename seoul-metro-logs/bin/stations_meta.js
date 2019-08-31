var fs = require('fs');
var parse = require('csv-parse');

var sInfo = fs.readFileSync('source/station_info.json', 'utf8');
var sLang = fs.readFileSync('source/station_lang.json', 'utf8');
var sLocation = JSON.parse(sInfo).DATA;
var sNames = JSON.parse(sLang).DATA;
// console.log(sLocation.length);
// console.log(sNames);

//위치정보 정리
//var location_meta = new Object();
var location_meta = new Array();
for(var i = 0; i < sLocation.length; i++){
  if(sLocation[i].xpoint_wgs !== "" &&
      (sLocation[i].line_num === "1" || sLocation[i].line_num === "2" || sLocation[i].line_num === "3" || sLocation[i].line_num === "4" || 
      sLocation[i].line_num === "5" || sLocation[i].line_num === "6" || sLocation[i].line_num === "7" || sLocation[i].line_num === "8" ||
       sLocation[i].line_num === "I" || sLocation[i].line_num === "B")
    ){
    //"서울" 은 "서울역" 으로 이름 변경.
    if(sLocation[i].station_nm === "서울"){ sLocation[i].station_nm = "서울역" }
    //
    location_meta.push({
      "station_nm" : sLocation[i].station_nm,
      //"line_num" : Number(sLocation[i].line_num),
      "geo_x" : Number(sLocation[i].xpoint_wgs),
      "geo_y" : Number(sLocation[i].ypoint_wgs)
    });
    // console.log("%j",location_meta[location_meta.length-1]);
  }
}

//다국어 역 정보 정리
var language_meta = new Object();
for(var i = 0; i < sNames.length; i++){
  if(sNames[i].stn_nm !== ""){
    var stn_name = sNames[i].stn_nm;
    
    var stn_nm_short = "";

    // 광나루\n(장신대) 같은 줄바꿈 이름 앞 이름만 따옴.
    if(sNames[i].stn_nm.indexOf("\n") > 0){
      stn_nm_short = sNames[i].stn_nm.split("\n")[0];
    } else {
      stn_nm_short = sNames[i].stn_nm;
    }

    // 총신대입구(이수) 같은 "(" 앞 이름만 따옴
    if(sNames[i].stn_nm.indexOf("(") > 0){
      stn_nm_short = sNames[i].stn_nm.split("(")[0];
    } else {
      stn_nm_short = sNames[i].stn_nm;
    }

    language_meta[stn_nm_short] = {
      "stn_nm_kor" : sNames[i].stn_nm,
      "stn_nm_chc" : sNames[i].stn_nm_chc,
      "stn_nm_eng" : sNames[i].stn_nm_eng,
      "stn_nm_chn" : sNames[i].stn_nm_chn,
      "stn_nm_jpn" : sNames[i].stn_nm_jpn
    }
  }
}
// console.log(language_meta);

//메타 병합
var stations_meta = new Object();
// console.log(location_meta.length); //629
for(var i=0; i < location_meta.length; i++){
  // console.log(language_meta[location_meta[i].station_nm]);
  // console.log(location_meta[i].station_nm);

  if(location_meta[i].station_nm === "총신대입구(이수)") { location_meta[i].station_nm = "이수"; }
  if(language_meta[location_meta[i].station_nm]){
    stations_meta[location_meta[i].station_nm] = {
      "stn_nm" : location_meta[i].station_nm.replace("\n",""),
      "stn_nm_kor" : language_meta[location_meta[i].station_nm].stn_nm_kor.replace("\n",""),
      "stn_nm_chc" : language_meta[location_meta[i].station_nm].stn_nm_chc.replace("\n",""),
      "stn_nm_eng" : language_meta[location_meta[i].station_nm].stn_nm_eng.replace("\n",""),
      "stn_nm_chn" : language_meta[location_meta[i].station_nm].stn_nm_chn.replace("\n",""),
      "stn_nm_jpn" : language_meta[location_meta[i].station_nm].stn_nm_jpn.replace("\n",""),
      "geo_x" : location_meta[i].geo_x,
      "geo_y" : location_meta[i].geo_y
    }
  } else {
    stations_meta[location_meta[i].station_nm] = {
      "stn_nm" : location_meta[i].station_nm.replace("\n",""),
      "geo_x" : location_meta[i].geo_x,
      "geo_y" : location_meta[i].geo_y
    }
  }
}

// console.log(stations_meta);
module.exports = stations_meta;


