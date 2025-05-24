import { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./App.css";

// 특정 월의 마지막 날짜 반환
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

// 날짜를 "yyyy.mm.dd" 형식으로 변환하는 함수
const formatDate = (year, month, day) => {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}.${mm}.${dd}`;
};

// 요일 구하는 함수
const getDayOfWeek = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
};

function App() {
  const [monthInput, setMonthInput] = useState("");

  const handleMonthChange = (e) => {
    setMonthInput(e.target.value);
  };

  const handleExcelDownload = async () => {
    if (!monthInput) {
      alert("연월을 선택해주세요.");
      return;
    }

    const [year, month] = monthInput.split("-").map(Number);
    const monthDays = getDaysInMonth(year, month);

    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    const nextMonthDays = getDaysInMonth(nextYear, nextMonth);

    try {
      const response = await fetch("/example.xlsx");
      const arrayBuffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const sheet1 = workbook.getWorksheet("Sheet1");
      sheet1.getCell("D2").value = `${month}월 일자별 운임`;

      let currentYear = year;
      let currentMonth = month;
      let currentDay = 1;

      // D8 ~ D24 날짜 + E열 요일
      for (let i = 8; i <= 24; i++) {
        const dateStr = formatDate(currentYear, currentMonth, currentDay);
        sheet1.getCell(`D${i}`).value = dateStr;
        sheet1.getCell(`E${i}`).value = getDayOfWeek(
          currentYear,
          currentMonth,
          currentDay
        );

        currentDay++;
        if (currentDay > monthDays) {
          currentDay = 1;
          currentMonth++;
          if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
          }
        }
      }

      // I8 ~ I21 날짜 + J열 요일
      for (let i = 8; i <= 21; i++) {
        const dateStr = formatDate(currentYear, currentMonth, currentDay);
        sheet1.getCell(`I${i}`).value = dateStr;
        sheet1.getCell(`J${i}`).value = getDayOfWeek(
          currentYear,
          currentMonth,
          currentDay
        );

        currentDay++;
        if (currentMonth === month && currentDay > monthDays) {
          currentDay = 1;
          currentMonth = nextMonth;
          currentYear = nextYear;
        } else if (currentMonth !== month && currentDay > nextMonthDays) {
          currentDay = 1;
          currentMonth++;
          if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
          }
        }
      }

      // Sheet1 셀 너비 조정
      sheet1.getColumn(4).width = 13; // D열
      sheet1.getColumn(5).width = 8; // E열 (요일)
      sheet1.getColumn(9).width = 13; // I열
      sheet1.getColumn(10).width = 8; // J열 (요일)

      // Sheet2 작업
      const sheet2 = workbook.getWorksheet("Sheet2");
      sheet2.getCell("D3").value = `${month}월 운임별 예상 수익 현황`;
      sheet2.getColumn(4).width = 16;

      sheet2.getCell("F10").value = { formula: "SUM(F8:F9)" };
      sheet2.getCell("F10").numFmt = '0 "만원"';
      sheet2.getCell("G10").value = { formula: "SUM(G8:G9)" };
      sheet2.getCell("G10").numFmt = '0 "만원"';
      sheet2.getCell("H10").value = { formula: "SUM(H8:H9)" };
      sheet2.getCell("H10").numFmt = '0 "만원"';
      sheet2.getCell("I10").value = { formula: "SUM(I8:I9)" };
      sheet2.getCell("I10").numFmt = '0 "만원"';

      // 파일 다운로드
      const modifiedBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([modifiedBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `${month}월 운임.xlsx`);
    } catch (err) {
      console.error("엑셀 처리 오류:", err);
      alert("엑셀 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container">
      <h2>운임 양식 만들기</h2>
      <input type="month" value={monthInput} onChange={handleMonthChange} />
      <button onClick={handleExcelDownload}>양식 생성</button>
    </div>
  );
}

export default App;
