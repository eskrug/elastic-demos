var fs = require('fs');
var parse = require('csv-parse');
var s_meta = require('./stations_meta');

//분석할 파일 이름 정확히 기입
var f1to4 = fs.readFileSync('source/metro_log_2018.csv', 'utf8');

parse(f1to4, {comment:"#"}, function(csv_err, csv_data){
  if (csv_err) {
    return console.log(csv_err);
  }
  
  // csv 파일 형태는 아래와 같이 되어야 함.
  // 0            1      2        3       4     5       6       7       ... 23      24      25
  // 날짜,        호선,   역번호, 역명,   구분, 05~06,  06~07,  07~08,  ... 23~24,  00~01,  합계
  // 2018-01-01,  1호선,  150,    서울역, 승차, 373,    318,    365,    ... 781,    96,     40393

  for(var cd=1; cd< csv_data.length ; cd+=2){
    var dataIn = csv_data[cd];
    var dataOut = csv_data[cd+1];
    if(dataIn[0]===dataOut[0] && dataIn[1]===dataOut[1] && dataIn[2]===dataOut[2] && dataIn[3]===dataOut[3]){
      
      // 역명
      var station_name = dataIn[3];
      
      // 날짜
      var ldateTemp = dataIn[0].split('-');
      // 시간 값으로 루프
      for(var h=0; h < 20; h++){
        var ldate = new Date(ldateTemp[0],Number(ldateTemp[1])-1,ldateTemp[2],h);
        // console.log(ldate);
        
        // 승차인원
        var people_in = dataIn[5+h];
        people_in = Number(people_in);

        // 하차인원
        var people_out = dataOut[5+h];
        people_out = Number(people_out);
        
        var line_num_lang = {
          "1호선" : "Line 1", "2호선" : "Line 2", "3호선" : "Line 3", "4호선" : "Line 4", 
          "5호선" : "Line 5", "6호선" : "Line 6", "7호선" : "Line 7", "8호선" : "Line 8"
        }

        // 역명에 () 포함하는 값들 모두 치환
        var stn_nm_full = station_name;
        if(station_name.indexOf("(") > 0){
          station_name = station_name.split("(")[0];
        }

        // if(h===0){
        //   console.log("station_name: "+station_name);
        //   console.log("stn_nm_full: "+ stn_nm_full);
        // }
        var s_logs = {};
        var t_st_nm = station_name;


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

        // if( t_st_nm.indexOf("구파발") > -1 ) { console.log(s_logs); }
        // console.log(s_logs);
        //console.log(ldate.toISOString().slice(0,10).replace(/-/g,""));
        // var fileName = "1to4_"+ldateTemp[0]+ldateTemp[1]+ldateTemp[2]+".log";
        //var fileName = "1to4_"+ldate.toISOString().slice(0,10).replace(/-/g,"")+".log";
        var logdata = JSON.stringify(s_logs)+"\n";
        
        // data 디렉토리 아래 저장할 파일 이름. data 디렉토리 없으면 생성해야 함
        fs.appendFileSync("data/seoul-metro-2018.logs", logdata);
      }

    }

  }

});
