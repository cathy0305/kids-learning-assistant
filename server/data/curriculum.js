import { fetchElementaryCurriculum } from '../utils/neis.js';

// 교육과정 데이터 구조화
function structureCurriculumData(rawData) {
  const structured = {
    "3-5": {
      subjects: {},
      topics: []
    },
    "6-9": {
      subjects: {},
      topics: []
    },
    "10-12": {
      subjects: {},
      topics: []
    }
  };

  // NEIS 데이터 처리 및 구조화
  if (rawData && rawData.elsTimetable) {
    rawData.elsTimetable.forEach(item => {
      // 학년별 데이터 분류
      const grade = parseInt(item.GRADE);
      let ageGroup;
      
      if (grade <= 2) ageGroup = "3-5";
      else if (grade <= 4) ageGroup = "6-9";
      else ageGroup = "10-12";

      // 과목별 데이터 정리
      if (!structured[ageGroup].subjects[item.ITRT_CNTNT]) {
        structured[ageGroup].subjects[item.ITRT_CNTNT] = {
          topics: new Set(),
          keywords: new Set()
        };
      }

      structured[ageGroup].subjects[item.ITRT_CNTNT].topics.add(item.ITRT_CNTNT);
    });
  }

  return structured;
}

// 교육과정 데이터 가져오기
async function getCurriculumData() {
  const rawData = await fetchElementaryCurriculum();
  return structureCurriculumData(rawData);
}

export { getCurriculumData };