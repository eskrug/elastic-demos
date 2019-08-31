# 공공데이터를 이용한 서울시 지하철 대시보드

## 1. 공공데이터로부터 추출, 색인, 매핑 및 템플릿 설정 부분까지

유튜브 링크 : [Elastic Stack을 이용한 서울시 지하철 대시보드 다시 만들기 #1](https://www.youtube.com/watch?v=ypsEZXVYLo4&list=PLhFRZgJc2afqxJx0RBKkYUxSUDJNusXPl)

### 프로그램 준비

git 파일들을 clone 한 뒤 elastic-demos/seoul-metro-logs 경로로 이동합니다.
```
git clone https://github.com/eskrug/elastic-demos.git
cd elastic-demos/seoul-metro-logs
```

seoul-metro-logs/ 경로에 `source`, `data` 디렉토리가 없는 경우 만들어 줘야 합니다.
```
mkdir source
mkdir data
```

### 공공 데이터 수집 

서울 열린 데이터 광장 접속 : https://data.seoul.go.kr/

<!-- kim*****1 / 8+!!  -->

#### 지하철역 위치 정보.

검색어 : **서울시 역코드로 지하철역 위치 조회**

- json 파일로 다운로드 
- `source/station_info.json` 으로 저장

#### 다국어 역명 정보

검색어 : **서울교통공사 지하철 역명 다국어 표기 정보**

- json 파일로 다운로드
- `source/station_lang.json` 으로 저장

#### 역별 승하차 인원 데이터셋

검색어 : **서울교통공사 연도별 일별 시간대별 역별 승하차 인원**

- 2018년 파일 다운로드
- Excel 로 열어서 편집 -> bin/run.js 파일을 주석을 참고해서
  - 1 행 삭제
  - B 열 (구분) 삭제
  - 다른 이름으로 저장 --> `source/metro_log_2018.csv`
- source/metro_log_2018.csv 파일 인코딩 **EUC-KR** 에서 **UTF-8** 로 변경 후 저장

### 파일 변환 프로그램 실행

`elastic-demos/seoul-metro-logs` 경로 에서 npm 패키지를 설치합니다.
```
npm install
```

변환 프로그램을 실행합니다.
```
node bin/run.js
```

프로그램이 실행되고 나면 data 디렉토리 아래에 `seoul-metro-2018.logs` 파일이 생성된 것을 확인합니다.
전체 **2,007,500** 라인 입니다.

### Logstash 를 이용해서 Elasticsearch 로 색인

Logstash 설정은 [config/seoul-metro-logs.conf](config/seoul-metro-logs.conf) 파일을 참고합니다.

로그스태시 elastic-demos/seoul-metro-logs 경로에 다운로드 후 압축을 풉니다.

```
sudo logstash-*/bin/logstash -f config/seoul-metro-logs.conf
```

### seoul-metro-logs* 템플릿 생성

mappings 와 settings 를 설정하기 위해 [config/index-settings-mappings.conf](config/index-settings-mappings.conf) 파일을 참고합니다.

1. order 값은 5로 설정
2. index_patterns 값은 seoul-metro-logs* 로 설정
```json
"order": 5,
"index_patterns": [
  "seoul-metro-logs*"
],
```

#### settings

1. 프라이머리 샤드 수를 2개로 설정
2. nori_tokenizer 토크나이저와 shingle 토큰필터를 활용한 nori 애널라이저를 생성
```json
"settings": {
  "number_of_shards": 2,
  "analysis": {
    "analyzer": {
      "nori": {
        "tokenizer": "nori_t_discard",
        "filter": "my_shingle"
      }
    },
    "tokenizer": {
      "nori_t_discard": {
        "type": "nori_tokenizer",
        "decompound_mode": "discard"
      }
    },
    "filter": {
      "my_shingle": {
        "type": "shingle",
        "token_separator": "",
        "max_shingle_size": 3
      }
    }
  }
}
```

#### mappings

1. code, line_num, line_num_en 값은 keyword 로 설정
2. location 필드 geo_point 로 설정
3. people.in, people.out, people.total 값은 integer 로 설정
4. station.kr, station.name 에 멀티필드로 nori 애널라이저를 적용한 station.kr.nori 추가

```json
"mappings": {
  "properties": {
    "@timestamp": {
      "type": "date"
    },
    "code": {
      "type": "keyword"
    },
    "line_num": {
      "type": "keyword"
    },
    "line_num_en": {
      "type": "keyword"
    },
    "location": {
      "type": "geo_point"
    },
    "people": {
      "properties": {
        "in": {
          "type": "integer"
        },
        "out": {
          "type": "integer"
        },
        "total": {
          "type": "integer"
        }
      }
    },
    "station": {
      "properties": {
        "kr": {
          "type": "text",
          "fields": {
            "nori": {
              "type": "text",
              "analyzer": "nori",
              "search_analyzer": "standard"
            },
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "name": {
          "type": "text",
          "fields": {
            "nori": {
              "type": "text",
              "analyzer": "nori",
              "search_analyzer": "standard"
            },
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        }
      }
    }
  }
}
```

[config/index-settings-mappings.conf](config/index-settings-mappings.conf) 파일 내용대로 실행해서 템플릿 저장.

이후 Logstash 데이터 다시 색인

계속해서 [2. Kibana 대시보드 생성](02-kibana-dashboard.md) 으로 이어집니다.