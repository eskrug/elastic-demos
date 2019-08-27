# 서울 메트로 Kibana 데모

## 공공 데이터 수집 

서울 열린 데이터 광장 접속 : https://data.seoul.go.kr/

<!-- kim*****1 / 8+!!  -->

### 지하철역 위치 정보.

검색어 : **서울시 역코드로 지하철역 위치 조회**

- json 파일로 다운로드 
- `source/station_info.json` 으로 저장

### 다국어 역명 정보

검색어 : **서울교통공사 지하철 역명 다국어 표기 정보**

- json 파일로 다운로드
- `source/station_lang.json` 으로 저장

### 역별 승하차 인원 데이터셋

검색어 : **서울교통공사 연도별 일별 시간대별 역별 승하차 인원**

- 2018년 파일 다운로드
- Excel 로 열어서 편집
  - 1 행 삭제
  - B 열 (구분) 삭제
  - 다른 이름으로 저장 --> `source/metro_log_2018.csv`
- source/metro_log_2018.csv 파일 인코딩 **EUC-KR** 에서 **UTF-8** 로 변경 후 저장.

## 파일 변환 프로그램 실행

`elastic-demos/seoul-metro-logs` 경로 에서 npm 패키지 설치
```
npm install
```

data 디렉토리가 없는 경우 만들어 줘야 함. 프로그램 실행.
```
mkdir data
node bin/run.js
```

data 디렉토리 아래에 `seoul-metro-2018.logs` 파일 생성 확인. 총 2,007,500 라인.

## Logstash 를 이용해서 Elasticsearch 로 색인

Logstash 설정은 `config/seoul-metro-logs.conf` 확인

```
sudo logstash-*/bin/logstash -f config/seoul-metro-logs.conf
```