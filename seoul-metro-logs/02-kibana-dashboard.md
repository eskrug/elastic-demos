# 공공데이터를 이용한 서울시 지하철 대시보드

[1. 공공데이터로부터 추출, 색인, 매핑 및 템플릿](01-data-process-ingest.md) 로 부터 이어서 진행합니다.

## 2. Kibana 대시보드

유튜브 링크 : Elastic Stack을 이용한 서울시 지하철 대시보드 다시 만들기 #2

먼저 아래 명령으로 데이터 색인이 끝났는지 확인합니다. 전체 도큐먼트 수는  `"count" : 2007500` 입니다.

```
GET seoul-metro-logs-2018/_count
```

### Kibana 인덱스 패턴 생성

- **Management > Kibana : Index Patterns** 메뉴로 이동
- **Create Index Pattern** 버튼 클릭
- **Index pattern** 입력폼에 `seoul-metro-logs*` 입력 후 **Next step** 클릭
- **Time Filter field name** 입력폼에 `@timestamp` 선택 후 **Create index pattern** 버튼 클릭

`seoul-metro-logs*` 인덱스 패턴이 생성 된 후 Discover 메뉴에서 데이터를 확인합니다.

- **Discover** 메뉴로 이동
- 저장된 인덱스 패턴 중 `seoul-metro-logs*` 를 선택
- 타임피커에서 날짜를 `2018-01-01` ~ `2019-01-01` 로 선택
- 데이터 확인

### 대시보드 저장

- **Dashboard** 메뉴로 이동
- **Create new dashboard** 버튼 클릭
- Add > 저장한 Visualization 선택
- Save : "서울 지하철 승하차인원" + 시간까지 같이 저장.

Visualization 추가 될 때 마다 위 과정 반복합니다.

### Visualizations

- **Visualizations** 메뉴로 이동
- **Create new visualization** 버튼 클릭

#### Metric : 승차인원 수, 하차인원 수, 전체인원 수

- **Metric** 선택
- **seoul-betro-logs\*** 인덱스 패턴 선택
- Metric 메뉴에서 전체 승차인원 추가
  - Aggregations : Sum
  - Field : `people.in`
  - Custom Labe : "전체 승차인원"
  - ▶️ 버튼 눌러 변경 사항 반영
- Metric 메뉴에서 전체 하차인원 추가
  - + Add 클릭해서 메트릭 추가
  - Aggregations : Sum
  - Field : `people.out`
  - Custom Labe : "전체 승차인원"
  - ▶️ 버튼 눌러 변경 사항 반영
- Metric 메뉴에서 전체 힘계 추가
  - Field : `people.total` 로 하고 다른 부분들은 반복
- options 탭으로 이동
  - style > Font Size : 20pt 정도로 조절

Save : "seoul-metro: 인원 수" 로 저장

#### TSVB : 승차인원 하차인원 전체인원 시간 그래프

승차인원 : 
- Panel Options
  - Index Pattern : `seoul-metro-logs*`
  - Time field : `@timestamp`
- Data
  - Aggregation : sum
  - Field : `people.in`
- 색깔 푸른색 계통으로 선택

하차인원 :
우측에 + 버튼 Add Series 추가
-  Field : `people.out` 
-  붉은색 계통으로 선택
-  나머지 동일

전체 :
버튼 : clone series 추가
-  Field : `people.total` 
- 녹색 계통으로 선택
- Option
  - Fill : 0
  - Line width : 0
  - Point Size : 2

Save : "seoul-metro: 승하차전체 인원 시계열 라인"


DayOfWeek :
Painless / String / 
return doc['@timestamp'].date.dayOfWeek;

HourOfDay :
Painless / Number
def date_of_time = doc['@timestamp'].date.hourOfDay+9;
return date_of_time % 24;

GET _ingest/pipeline/seoul-metro-logs
{
  "seoul-metro-logs" : {
    "description" : "modify seoul-metro-logs-* indices.",
    "processors" : [
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Mon'",
          "field" : "day_of_week.kr",
          "value" : "월"
        }
      },
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Tue'",
          "field" : "day_of_week.kr",
          "value" : "화"
        }
      },
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Wed'",
          "field" : "day_of_week.kr",
          "value" : "수"
        }
      },
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Thu'",
          "field" : "day_of_week.kr",
          "value" : "목"
        }
      },
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Fri'",
          "field" : "day_of_week.kr",
          "value" : "금"
        }
      },
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Sat'",
          "field" : "day_of_week.kr",
          "value" : "토"
        }
      },
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Sun'",
          "field" : "day_of_week.kr",
          "value" : "일"
        }
      },
      {
        "set" : {
          "field" : "day_of_week.st_mon",
          "value" : "{{day_of_week.num}}"
        }
      },
      {
        "set" : {
          "if" : "ctx.day_of_week.txt=='Sun'",
          "field" : "day_of_week.st_mon",
          "value" : 7
        }
      },
      {
        "convert" : {
          "field" : "day_of_week.st_mon",
          "type" : "integer"
        }
      },
      {
        "rename" : {
          "field" : "day_of_week.txt",
          "target_field" : "day_of_week.en"
        }
      },
      {
        "rename" : {
          "field" : "day_of_week.num",
          "target_field" : "day_of_week.st_sun"
        }
      },
      {
        "remove" : {
          "field" : "day_of_week.all"
        }
      },
      {
        "rename" : {
          "field" : "stn_nm_eng",
          "target_field" : "station.en"
        }
      },
      {
        "rename" : {
          "field" : "stn_nm_chc",
          "target_field" : "station.chc"
        }
      },
      {
        "rename" : {
          "field" : "stn_nm_chn",
          "target_field" : "station.chn"
        }
      },
      {
        "rename" : {
          "field" : "stn_nm_jpn",
          "target_field" : "station.jp"
        }
      },
      {
        "rename" : {
          "field" : "stn_nm",
          "target_field" : "station.kr"
        }
      },
      {
        "rename" : {
          "field" : "name",
          "target_field" : "station.kr_short"
        }
      },
      {
        "rename" : {
          "field" : "line_num",
          "target_field" : "line.name"
        }
      },
      {
        "rename" : {
          "field" : "line_num_short",
          "target_field" : "line.short"
        }
      },
      {
        "rename" : {
          "field" : "people_in",
          "target_field" : "people.in"
        }
      },
      {
        "rename" : {
          "field" : "people_out",
          "target_field" : "people.out"
        }
      },
      {
        "script" : {
          "lang" : "painless",
          "source" : "ctx.people.total = ctx.people.in + ctx.people.out"
        }
      }
    ]
  }
}
