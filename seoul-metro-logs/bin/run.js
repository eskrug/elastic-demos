var fs = require('fs');
var parse = require('csv-parse');
// var s_meta = require('./stations_meta');

//분석할 파일 이름 정확히 기입
var f1to4 = fs.readFileSync('source/seoul-metro-2015.csv', 'utf8');
var targetFileName = "data/seoul-metro-2015.logs.csv"

parse(f1to4, {comment:"#"}, function(csv_err, csv_data){
  if (csv_err) {
    return console.log(csv_err);
  }
  
  // csv 파일 형태는 아래와 같이 되어야 함.
  // 0            1      2        3       4     5       6       7       ... 23      24      25
  // 날짜,        호선,   역번호, 역명,   구분, 05~06,  06~07,  07~08,  ... 23~24,  00~01,  합계
  // 2018-01-01,  1호선,  150,    서울역, 승차, 373,    318,    365,    ... 781,    96,     40393

  var strtClm = 0;
  var timeTo24 = 1;
  var hasLineNum = 0;
  // 2줄씩 루프 돌면서 0~3 열 까지의 데이터가 동일한지 확인
  fs.appendFileSync(targetFileName, ["timestamp", "station_code", "people_in","people_out"] + "\n");

  for(var cd=1; cd< csv_data.length ; cd+=2){
    var dataIn = csv_data[cd];
    var dataOut = csv_data[cd+1];
    if(dataIn[(hasLineNum)]===dataOut[(hasLineNum)] && dataIn[(hasLineNum+1)]===dataOut[(hasLineNum+1)] && dataIn[(hasLineNum+2)]===dataOut[(hasLineNum+2)]){
      // 역명
      // var station_name = dataIn[4];
      // 날짜
      var ldateTemp = dataIn[strtClm].split('-');
      // 시간 값으로 루프
      // for(var h=1; h < 20; h++){
      for(var h=0; h < (timeTo24+19); h++){
        var tDate = new Date(ldateTemp[0],Number(ldateTemp[1])-1,ldateTemp[2],(h+14));
        var ldate = tDate.toISOString().replace("Z","+09:00")
        // 승차인원
        var people_in = dataIn[strtClm+hasLineNum+4+h];
        people_in = Number(people_in);

        // 하차인원
        var people_out = dataOut[strtClm+hasLineNum+4+h];
        people_out = Number(people_out);
        /*
        var line_num_lang = {
          "1호선" : "Line 1", "2호선" : "Line 2", "3호선" : "Line 3", "4호선" : "Line 4", 
          "5호선" : "Line 5", "6호선" : "Line 6", "7호선" : "Line 7", "8호선" : "Line 8"
        }
        */
        /** 역명에 () 포함하는 값들 모두 치환
        var stn_nm_full = station_name;
        if(station_name.indexOf("(") > 0){
          station_name = station_name.split("(")[0];
        }
        */

        // console.log("station_name: "+station_name);

        // if(h===0){
        //   console.log("station_name: "+station_name);
        //   console.log("stn_nm_full: "+ stn_nm_full);
        // }
        
        var s_logs = [];
        // var t_st_nm = station_name;
        
        // s_logs = [ldate, dataIn[3], dataIn[2], station_name, people_in, people_out]
        // s_logs = [ldate, dataIn[3], dataIn[2], people_in, people_out]
        s_logs = [ldate, dataIn[(strtClm+hasLineNum+1)], people_in, people_out]

        // s_logs = {
        //   "@timestamp" : ldate,
        //   "code": dataIn[3],
        //   "line_num" : dataIn[2],
        //   "station_name": station_name,
        //   "people":{
        //     "in" : people_in,
        //     "out" : people_out,
        //     "total" : people_in+people_out
        //   }
        // }

        /**
        if(station_name === "총신대입구") {
          t_st_nm = "이수"; 
          stn_nm_full = "총신대입구(이수)"
        } else {
          if(!s_meta[t_st_nm]){
            // if(h===0){ console.log("s_meta[stn_nm_full]: %j ",s_meta[stn_nm_full]); }
            t_st_nm = stn_nm_full;
          }
        }
        // if(h===0 ){ console.log(t_st_nm); }
         */

        /**
        if(s_meta[t_st_nm].stn_nm_kor){
          s_logs = {
            "@timestamp" : ldate,
            "code": dataIn[2],
            "line_num" : dataIn[1],
            "line_num_en" : line_num_lang[dataIn[1]],
            "station": {
              "name" : stn_nm_full,
              "kr" : s_meta[t_st_nm].stn_nm_kor,
              "en" : s_meta[t_st_nm].stn_nm_eng,
              "chc" : s_meta[t_st_nm].stn_nm_chc,
              "ch" : s_meta[t_st_nm].stn_nm_chn,
              "jp" : s_meta[t_st_nm].stn_nm_jpn
            },
            "location" : {
              "lat" : s_meta[t_st_nm].geo_x,
              "lon" : s_meta[t_st_nm].geo_y
            },
            "people":{
              "in" : people_in,
              "out" : people_out,
              "total" : people_in+people_out
            }
          }
        } else {
          s_logs = {
            "@timestamp" : ldate,
            "code": dataIn[2],
            "line_num" : dataIn[1],
            "line_num_en" : line_num_lang[dataIn[1]],
            "station": {
              "name" : stn_nm_full
            },
            "location" : {
              "lat" : s_meta[t_st_nm].geo_x,
              "lon" : s_meta[t_st_nm].geo_y
            },
            "people":{
              "in" : people_in,
              "out" : people_out,
              "total" : people_in+people_out
            }
          }
        }
        */
       
        // if( t_st_nm.indexOf("구파발") > -1 ) { console.log(s_logs); }
        // console.log(s_logs);
        //console.log(ldate.toISOString().slice(0,10).replace(/-/g,""));
        // var fileName = "1to4_"+ldateTemp[0]+ldateTemp[1]+ldateTemp[2]+".log";
        //var fileName = "1to4_"+ldate.toISOString().slice(0,10).replace(/-/g,"")+".log";
        
        // var logdata = JSON.stringify(s_logs)+"\n";

        var logdata = s_logs + "\n";
        
        // data 디렉토리 아래 저장할 파일 이름. data 디렉토리 없으면 생성해야 함
        fs.appendFileSync(targetFileName, logdata);
      }

    }

  }

});
