const fs = require('fs');
// const parse = require('csv-parse');
const parse = require('csv-parse/lib/sync')


const sInfo = fs.readFileSync('source/station_info.json', 'utf8');
const sLang = fs.readFileSync('source/station_lang.json', 'utf8');
const sLocation = JSON.parse(sInfo).DATA;
const sNames = JSON.parse(sLang).DATA;
// console.log(sLocation.length);
// console.log(sNames);


// 2020-01 지하철역 주소 및 전화번호 정보 추가
const fsAddr1to4 = fs.readFileSync('source/station_addr_1to4.json', 'utf8');
const sAddr1to4 = JSON.parse(fsAddr1to4).DATA;
const fsAddr5to8 = fs.readFileSync('source/station_addr_5to8.json', 'utf8');
const sAddr5to8 = JSON.parse(fsAddr5to8).DATA;

//위치정보 정리
let location_meta = new Array();
let line = {};
let line_name = "";
let location = {};
let station_i = {};

for(let i = 0; i < sLocation.length; i++){
  if(sLocation[i].station_nm === "서울"){ sLocation[i].station_nm = "서울역" }
  if(sLocation[i].station_nm === "서울(경의중앙선)"){ sLocation[i].station_nm = "서울역(경의중앙선)" }
  //
  switch(sLocation[i].line_num){
    case "A" :
      line_name = "공항철도"
      break;
    case "B" :
      line_name = "분당선"
      break;
    case "E" :
      line_name = "용인경전철"
      break;
    case "G" :
      line_name = "경춘선"
      break;
    case "K" :
      line_name = "경의중앙선"
      break;
    case "KK" :
      line_name = "경강선"
      break;
    case "S" :
      line_name = "신분당선"
      break;
    case "I" :
      line_name = "인천1호선"
      break;
    case "I2" :
      line_name = "인천2호선"
      break;
    case "SU" :
      line_name = "수인선"
      break;
    case "U" :
      line_name = "의정부경전철"
      break;
    case "UI" :
      line_name = "우이신설선"
      break;
    default:
      line_name = sLocation[i].line_num + "호선"
  }
  line = {
    "code" : sLocation[i].line_num,
    "name" : line_name
  }
  station_i = {
    "code" : parseInt(sLocation[i].cyber_st_code),
    "fr_code" : sLocation[i].fr_code,
    "name": sLocation[i].station_nm.split("(")[0],
    "name_full" : sLocation[i].station_nm,
  }

  location_meta.push({
    "line" : line,
    "station" : station_i
  });

  if(sLocation[i].xpoint_wgs !== null){
    location = {
      "lat" : Number(sLocation[i].xpoint_wgs),
      "lon" : Number(sLocation[i].ypoint_wgs)
    }
    const geo = {"location": location};
    Object.assign(location_meta[i], {"geo": geo});
  }
  // console.log(location_meta[i]);
}
// console.log(location_meta);

//다국어 역 정보 정리
let language_meta = new Object();
// let lang_lenth = 0;
for(let i = 0; i < sNames.length; i++){
  if(sNames[i].stn_nm !== ""){
    sNames[i].stn_nm = sNames[i].stn_nm.replace("\n","");
    // 총신대입구(이수) 같은 "(" 앞 이름만 따옴
    stn_nm_short = sNames[i].stn_nm.split("(")[0];
    language_meta[stn_nm_short] = {
      "stn_nm_short" : stn_nm_short,
      "stn_nm_kor" : sNames[i].stn_nm,
      "stn_nm_chc" : sNames[i].stn_nm_chc.replace("\n",""),
      "stn_nm_eng" : sNames[i].stn_nm_eng.replace("\n",""),
      "stn_nm_chn" : sNames[i].stn_nm_chn.replace("\n",""),
      "stn_nm_jpn" : sNames[i].stn_nm_jpn.replace("\n",""),
    }
    // lang_lenth++;
  }
}

const csvLang = fs.readFileSync('source/station_lang.csv', 'utf8');
const csv_data = parse(csvLang, {comment:"#"});
let tmp_st_name = "";
let tmp_st_name_full = "";
for(let cd=0; cd< csv_data.length ; cd++){
  // console.log(csv_data[cd][2]);
  tmp_st_name = csv_data[cd][2].replace(" ","").replace(" ","").replace(" ","").split("(")[0];
  tmp_st_name_full = csv_data[cd][2].replace(" ","").replace(" ","").replace(" ","");
  tmp_st_name_chc = csv_data[cd][3].replace(" ","").replace(" ","").replace(" ","");
  tmp_st_name_eng = csv_data[cd][4];
  tmp_st_name_chn = csv_data[cd][5].replace(" ","").replace(" ","").replace(" ","");
  tmp_st_name_jpn = csv_data[cd][6].replace(" ","").replace(" ","").replace(" ","");
  if(!language_meta[tmp_st_name]){
    // console.log(tmp_st_name);
    language_meta[tmp_st_name] = {
      "stn_nm_short" : tmp_st_name,
      "stn_nm_kor" : tmp_st_name_full,
      "stn_nm_chc" : tmp_st_name_chc,
      "stn_nm_eng" : tmp_st_name_eng,
      "stn_nm_chn" : tmp_st_name_chn,
      "stn_nm_jpn" : tmp_st_name_jpn,
    }
  } else {
    if(tmp_st_name_full !== language_meta[tmp_st_name].stn_nm_kor) {
      if(tmp_st_name_full.length > language_meta[tmp_st_name].stn_nm_kor.length) {
        language_meta[tmp_st_name].stn_nm_kor = tmp_st_name_full;
      }
      // console.log(tmp_st_name_full + " : " + language_meta[tmp_st_name].stn_nm_kor);
    }
  }
}
// console.log(language_meta);
// console.log(lang_lenth); // 258

let stations_addr = {}
for(var i=0; i < sAddr1to4.length; i++){
  // console.log(sAddr1to4[i]);
  if(sAddr1to4[i].statn_nm === "신천") { sAddr1to4[i].statn_nm = sAddr1to4[i].statn_nm.replace("신천","잠실새내") }
  stations_addr[sAddr1to4[i].statn_nm] = {
    "address" : sAddr1to4[i].adres,
    "road_address" : sAddr1to4[i].rdnmadr,
    "phone" : sAddr1to4[i].telno,
  }
}
for(var i=0; i < sAddr5to8.length; i++){
  if(sAddr5to8[i] && sAddr5to8[i].stn_nm !== "서울역" ){
    if(sAddr5to8[i].stn_nm === "역촌역"){
      sAddr5to8[i].stn_nm = "역촌";
    } else {
      sAddr5to8[i].stn_nm = sAddr5to8[i].stn_nm.split("역")[0];
    }
  }
  stations_addr[sAddr5to8[i].stn_nm] = {
    "address" : sAddr5to8[i].stn_addr,
    "road_address" : sAddr5to8[i].stn_road_addr,
    "phone" : sAddr5to8[i].stn_phone,
  }
}
// console.log(stations_addr);

//메타 병합
// console.log(location_meta.length); //929
for(var i=0; i < location_meta.length; i++){
  // console.log(language_meta[location_meta[i].station_nm]);
  // console.log(location_meta[i].station_nm);

  // if(location_meta[i].station_nm === "총신대입구(이수)") { location_meta[i].station_nm = "이수"; }
  if(language_meta[location_meta[i].station.name]){
    // Object.assign(location_meta[i].station, {language: language_meta[location_meta[i].station.name]});
    Object.assign(location_meta[i].station, {name_jpn: language_meta[location_meta[i].station.name].stn_nm_jpn});
    Object.assign(location_meta[i].station, {name_eng: language_meta[location_meta[i].station.name].stn_nm_eng});
    Object.assign(location_meta[i].station, {name_chc: language_meta[location_meta[i].station.name].stn_nm_chc});
    Object.assign(location_meta[i].station, {name_chn: language_meta[location_meta[i].station.name].stn_nm_chn});
    if(language_meta[location_meta[i].station.name].stn_nm_kor.indexOf("(")>0 ){
      location_meta[i].station.name_full = language_meta[location_meta[i].station.name].stn_nm_kor;
      // console.log(location_meta[i]);
    }
  }

  if(stations_addr[location_meta[i].station.name]){
    // console.log(stations_addr[location_meta[i].station.name].address);
    Object.assign(location_meta[i].geo, {
      "address": stations_addr[location_meta[i].station.name].address,
      "road_address": stations_addr[location_meta[i].station.name].road_address,
      "phone": stations_addr[location_meta[i].station.name].phone
    });
    // location_meta[i].contact = {
    //   "address": stations_addr[location_meta[i].station.name].address,
    //   "road_address": stations_addr[location_meta[i].station.name].road_address,
    //   "phone": stations_addr[location_meta[i].station.name].phone
    // };
  } else {
    // console.log(location_meta[i]);
  }

  if(location_meta[i].station.name_full.indexOf("왕십리")>-1){
    // console.log(location_meta[i]);
  }
  console.log("%j", {"index":{"_id":location_meta[i].station.fr_code}});
  console.log("%j",location_meta[i]);
}

// console.log(location_meta);
