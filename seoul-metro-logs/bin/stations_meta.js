var fs = require('fs');
// var parse = require('csv-parse');

var sInfo = fs.readFileSync('source/station_info.json', 'utf8');
var sLang = fs.readFileSync('source/station_lang.json', 'utf8');
var sLocation = JSON.parse(sInfo).DATA;
var sNames = JSON.parse(sLang).DATA;
// console.log(sLocation.length);
// console.log(sNames);

// 2020-01 지하철역 주소 및 전화번호 정보 추가
var fsAddr1to4 = fs.readFileSync('source/station_addr_1to4.json', 'utf8');
var sAddr1to4 = JSON.parse(fsAddr1to4).DATA;
var fsAddr5to8 = fs.readFileSync('source/station_addr_5to8.json', 'utf8');
var sAddr5to8 = JSON.parse(fsAddr5to8).DATA;

//위치정보 정리
//var location_meta = new Object();
var location_meta = new Array();
for(var i = 0; i < sLocation.length; i++){
  if(sLocation[i].xpoint_wgs !== "" 
      // &&
      // (sLocation[i].line_num === "1" || sLocation[i].line_num === "2" || sLocation[i].line_num === "3" || sLocation[i].line_num === "4" || 
      // sLocation[i].line_num === "5" || sLocation[i].line_num === "6" || sLocation[i].line_num === "7" || sLocation[i].line_num === "8" ||
      //  sLocation[i].line_num === "I" || sLocation[i].line_num === "B")
    ){
    //"서울" 은 "서울역" 으로 이름 변경.
    if(sLocation[i].station_nm === "서울"){ sLocation[i].station_nm = "서울역" }
    //
    
    location_meta.push({
      "line_num" : sLocation[i].line_num,
      "station_code" : parseInt(sLocation[i].cyber_st_code),
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
      "line_num" : location_meta[i].line_num,
      "station_code" : location_meta[i].station_code,
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
      "station_code" : location_meta[i].station_code,
      "stn_nm" : location_meta[i].station_nm.replace("\n",""),
      "geo_x" : location_meta[i].geo_x,
      "geo_y" : location_meta[i].geo_y
    }
  }
}

for(var i=0; i < sAddr1to4.length; i++){
  // console.log(sAddr1to4[i]);
  if(sAddr1to4[i].statn_nm === "신천") { sAddr1to4[i].statn_nm = sAddr1to4[i].statn_nm.replace("신천","잠실새내") }
  if(sAddr1to4[i].statn_nm === "총신대입구") { sAddr1to4[i].statn_nm = sAddr1to4[i].statn_nm.replace("총신대입구","이수") }
  
  if(stations_meta[sAddr1to4[i].statn_nm]){
    stations_meta[sAddr1to4[i].statn_nm].address = sAddr1to4[i].adres;
    stations_meta[sAddr1to4[i].statn_nm].road_address = sAddr1to4[i].rdnmadr;
    stations_meta[sAddr1to4[i].statn_nm].phone = sAddr1to4[i].telno;
  }
  // console.log(sAddr1to4[i]);
}

for(var i=0; i < sAddr5to8.length; i++){
  if(sAddr5to8[i] && sAddr5to8[i].stn_nm !== "서울역" ){
    if(sAddr5to8[i].stn_nm === "역촌역"){
      sAddr5to8[i].stn_nm = "역촌";
    } else {
      sAddr5to8[i].stn_nm = sAddr5to8[i].stn_nm.split("역")[0];
    }
  }
  if(stations_meta[sAddr5to8[i].stn_nm]){
    stations_meta[sAddr5to8[i].stn_nm].address = sAddr5to8[i].stn_addr;
    stations_meta[sAddr5to8[i].stn_nm].road_address = sAddr5to8[i].stn_road_addr;
    stations_meta[sAddr5to8[i].stn_nm].phone = sAddr5to8[i].stn_phone;
  }
  // console.log(sAddr5to8[i]);
}

// console.log("%j",stations_meta);
module.exports = stations_meta;
