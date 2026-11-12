import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageBreak,
  Packer
} from 'docx';
import { Exam } from '../src/types/index.js';

export async function generateExamDocx(exam: Exam, includeSolutions = true, includeMatrix = true): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Helper for borderless table cells
  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  };

  // 1. Header (School info and Exam Title in two columns)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: exam.district.toUpperCase(), size: 20 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: exam.school.toUpperCase(), bold: true, size: 21 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Mã đề thi: ${exam.code}`, bold: true, size: 20 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: exam.title.toUpperCase(), bold: true, size: 22 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Năm học: ${exam.schoolYear}`, italics: true, size: 20 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Môn: Ngữ văn - Lớp ${exam.grade}`, bold: true, size: 21 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Thời gian làm bài: ${exam.durationMinutes} phút (Không kể thời gian phát đề)`, italics: true, size: 19 }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(headerTable);
  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Student info line
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Họ và tên học sinh: ............................................................................ Lớp: ......................... SBD: .................', italics: true, size: 20 }),
      ],
      spacing: { after: 250 },
    })
  );

  // SECTION I: ĐỌC HIỂU
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `I. PHẦN ĐỌC HIỂU (${exam.readingScore.toFixed(1)} điểm)`, bold: true, size: 22 }),
      ],
      spacing: { before: 150, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Đọc văn bản sau và thực hiện các yêu cầu bên dưới:', italics: true, size: 21 }),
      ],
      spacing: { after: 120 },
    })
  );

  // Reading Passage Box / Paragraphs
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: exam.readingPassage.title.toUpperCase(), bold: true, size: 21 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
    })
  );

  const passageLines = exam.readingPassage.content.split('\n');
  for (const line of passageLines) {
    if (line.trim().length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: line, italics: false, size: 21 }),
          ],
          indent: { firstLine: 360 },
          spacing: { after: 80 },
        })
      );
    }
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `(Nguồn: ${exam.readingPassage.author}, "${exam.readingPassage.title}", ${exam.readingPassage.source})`, italics: true, size: 19 }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 250 },
    })
  );

  // Questions
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Trả lời các câu hỏi sau:', bold: true, size: 21 }),
      ],
      spacing: { after: 120 },
    })
  );

  exam.readingQuestions.forEach((q, idx) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Câu ${idx + 1} (${q.score.toFixed(1)} điểm): `, bold: true, size: 21 }),
          new TextRun({ text: q.question, size: 21 }),
        ],
        spacing: { before: 100, after: 60 },
      })
    );

    if (q.type === 'trac_nghiem' && q.options && q.options.length > 0) {
      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, optIdx) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `    ${letters[optIdx]}. `, bold: true, size: 20 }),
              new TextRun({ text: opt, size: 20 }),
            ],
            spacing: { after: 40 },
          })
        );
      });
    }
  });

  // SECTION II: VIẾT
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `II. PHẦN TẬP LÀM VĂN / VIẾT (${exam.writingScore.toFixed(1)} điểm)`, bold: true, size: 22 }),
      ],
      spacing: { before: 250, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: exam.writingQuestion.topic, size: 21 }),
      ],
      indent: { firstLine: 360 },
      spacing: { after: 100 },
    })
  );

  if (exam.writingQuestion.requirements) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `* Yêu cầu: ${exam.writingQuestion.requirements}`, italics: true, size: 20 }),
        ],
        indent: { firstLine: 360 },
        spacing: { after: 200 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '---------------- HẾT ----------------', bold: true, size: 20 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 150 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '(Cán bộ coi thi không giải thích gì thêm)', italics: true, size: 19 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // 2. SOLUTIONS & GRADING GUIDE
  if (includeSolutions) {
    children.push(new Paragraph({ children: [new PageBreak()] }));

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: exam.school.toUpperCase(), bold: true, size: 20 }),
          new TextRun({ text: '   |   ', size: 20 }),
          new TextRun({ text: `HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM (MÃ ĐỀ: ${exam.code})`, bold: true, size: 22 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'I. PHẦN ĐỌC HIỂU (HƯỚNG DẪN CHẤM CHI TIẾT)', bold: true, size: 21 }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );

    // Reading guide table
    const guideRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Câu', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 73, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Nội dung đáp án & yêu cầu cần đạt', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Điểm', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
        ],
      }),
    ];

    exam.readingQuestions.forEach((q, idx) => {
      guideRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: `Câu ${idx + 1}`, bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 73, type: WidthType.PERCENTAGE },
              borders: tableBorder,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: q.type === 'trac_nghiem' ? `Đáp án đúng: ${q.answer}` : q.answer, bold: q.type === 'trac_nghiem', size: 20 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Hướng dẫn: ${q.guide}`, italics: true, size: 19 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders: tableBorder,
              children: [new Paragraph({ children: [new TextRun({ text: `${q.score.toFixed(1)} đ`, size: 20 })], alignment: AlignmentType.CENTER })],
            }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        rows: guideRows,
      })
    );

    // Writing Rubric Table
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'II. PHẦN TẬP LÀM VĂN / VIẾT (TIÊU CHÍ CHẤM)', bold: true, size: 21 }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    const rubricRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Tiêu chí đánh giá', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Yêu cầu cụ thể theo chuẩn GDPT 2018', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: tableBorder,
            children: [new Paragraph({ children: [new TextRun({ text: 'Điểm', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
          }),
        ],
      }),
    ];

    if (exam.writingQuestion.rubricCriteria && exam.writingQuestion.rubricCriteria.length > 0) {
      exam.writingQuestion.rubricCriteria.forEach((crit) => {
        rubricRows.push(
          new TableRow({
            children: [
              new TableCell({
                borders: tableBorder,
                children: [new Paragraph({ children: [new TextRun({ text: crit.name, bold: true, size: 20 })] })],
              }),
              new TableCell({
                borders: tableBorder,
                children: [new Paragraph({ children: [new TextRun({ text: crit.description, size: 20 })] })],
              }),
              new TableCell({
                borders: tableBorder,
                children: [new Paragraph({ children: [new TextRun({ text: `${crit.score.toFixed(1)} đ`, size: 20 })], alignment: AlignmentType.CENTER })],
              }),
            ],
          })
        );
      });
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        rows: rubricRows,
      })
    );
  }

  // 3. MATRIX TABLE
  if (includeMatrix && exam.matrix && exam.matrix.rows) {
    children.push(new Paragraph({ children: [new PageBreak()] }));

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ', bold: true, size: 22 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Môn: Ngữ văn ${exam.grade} - Thời gian: ${exam.durationMinutes} phút`, italics: true, size: 20 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
      })
    );

    const matrixTableRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'TT', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Kĩ năng', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Nội dung / Đơn vị kiến thức', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Nhận biết', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Thông hiểu', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Vận dụng', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Vận dụng cao', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Tổng điểm', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Tỉ lệ %', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
        ],
      }),
    ];

    exam.matrix.rows.forEach((r, idx) => {
      matrixTableRows.push(
        new TableRow({
          children: [
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, size: 19 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: r.strand, bold: true, size: 19 })] })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: r.subStrand, size: 19 })] })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${r.nhanBiet.score}đ (${r.nhanBiet.tnCount}TN)`, size: 18 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${r.thongHieu.score}đ (${r.thongHieu.tnCount}TN/${r.thongHieu.tlCount}TL)`, size: 18 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${r.vanDung.score}đ (${r.vanDung.tlCount}TL)`, size: 18 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${r.vanDungCao.score}đ (${r.vanDungCao.tlCount}TL)`, size: 18 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${r.totalScore}đ`, bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${r.percentage}%`, size: 19 })], alignment: AlignmentType.CENTER })] }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        rows: matrixTableRows,
      })
    );
  }

  // 4. SPECIFICATION TABLE
  if (includeMatrix && exam.specification && exam.specification.items) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA', bold: true, size: 22 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      })
    );

    const specTableRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Câu', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Kĩ năng', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Mức độ', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Yêu cầu cần đạt chuẩn GDPT 2018', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Hình thức', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
          new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Điểm', bold: true, size: 19 })], alignment: AlignmentType.CENTER })] }),
        ],
      }),
    ];

    exam.specification.items.forEach((item) => {
      specTableRows.push(
        new TableRow({
          children: [
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: item.number, bold: true, size: 18 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: item.strand, size: 18 })] })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: item.cognitiveLevel, size: 18 })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: item.standardRequired, size: 18 })] })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: item.questionType, size: 18 })] })] }),
            new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: `${item.score}đ`, bold: true, size: 18 })], alignment: AlignmentType.CENTER })] }),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorder,
        rows: specTableRows,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2cm
              bottom: 1134,
              left: 1418, // ~2.5cm
              right: 1134,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
