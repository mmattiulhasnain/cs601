import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak
} from "docx";
import { AssignmentSolution, StudentInfo, AssignmentHeader } from "../types";

function getMismatchTextRuns(
  sent: string,
  received: string,
  displayType: "sent" | "received",
  mismatchHighlight: "red" | "yellow" | "underline" | "none"
): TextRun[] {
  const runs: TextRun[] = [];
  const minLen = Math.min(sent.length, received.length);
  const target = displayType === "sent" ? sent : received;

  for (let i = 0; i < target.length; i++) {
    const char = target[i];
    const isMismatched = i < minLen && sent[i] !== received[i];

    if (isMismatched) {
      if (mismatchHighlight === "none") {
        runs.push(new TextRun({ text: char, font: "Consolas", size: 18, color: "1E293B" }));
      } else if (mismatchHighlight === "yellow") {
        runs.push(new TextRun({ text: char, font: "Consolas", size: 18, bold: true, highlight: "yellow", color: "1E293B" }));
      } else if (mismatchHighlight === "underline") {
        runs.push(new TextRun({ text: char, font: "Consolas", size: 18, bold: true, underline: {}, color: "1E293B" }));
      } else {
        // "red" - academic standard dark red
        runs.push(new TextRun({ text: char, font: "Consolas", size: 18, bold: true, color: "C00000" }));
      }
    } else {
      runs.push(new TextRun({ text: char, font: "Consolas", size: 18, color: "475569" }));
    }
  }
  return runs;
}

export async function generateAndDownloadDocx(
  solution: AssignmentSolution,
  student: StudentInfo,
  header: AssignmentHeader,
  options: {
    wordFont: "Calibri" | "TimesNewRoman" | "Arial" | "Georgia" | "Consolas";
    tableStyle: "grid" | "booktabs" | "stripe" | "faint";
    headingStyle: "standard" | "leftborder" | "centered" | "italic";
    spacingDensity: "comfortable" | "compact" | "double";
    coverBorder: "none" | "thin" | "double";
    mismatchHighlight: "red" | "yellow" | "underline" | "none";
  }
) {
  const { wordFont, tableStyle, headingStyle, spacingDensity, coverBorder, mismatchHighlight } = options;
  const primaryColor = solution.colorTheme.primaryHex;
  const secondaryColor = solution.colorTheme.secondaryHex;

  // Font mappings
  let fontName = "Calibri";
  if (wordFont === "TimesNewRoman") fontName = "Times New Roman";
  else if (wordFont === "Arial") fontName = "Arial";
  else if (wordFont === "Georgia") fontName = "Georgia";
  else if (wordFont === "Consolas") fontName = "Consolas";

  // Sizes based on font and density
  let baseBodySize = wordFont === "TimesNewRoman" || wordFont === "Georgia" ? 24 : 22; // 12pt vs 11pt
  let baseHeading1Size = wordFont === "TimesNewRoman" || wordFont === "Georgia" ? 28 : 26; // 14pt vs 13pt
  let baseHeading2Size = wordFont === "TimesNewRoman" || wordFont === "Georgia" ? 24 : 22; // 12pt vs 11pt

  if (spacingDensity === "compact") {
    baseBodySize -= 2; // e.g. 10pt
    baseHeading1Size -= 2;
    baseHeading2Size -= 2;
  } else if (spacingDensity === "double") {
    baseBodySize += 2; // e.g. 12pt
    baseHeading1Size += 2;
    baseHeading2Size += 2;
  }

  const bodySize = baseBodySize;
  const heading1Size = baseHeading1Size;
  const heading2Size = baseHeading2Size;

  // Spacing helper
  const lineSpacing = spacingDensity === "compact" ? 220 : (spacingDensity === "double" ? 360 : 276);
  const paragraphSpacingAfter = spacingDensity === "compact" ? 100 : (spacingDensity === "double" ? 220 : 160);
  const paragraphSpacingBefore = spacingDensity === "compact" ? 60 : (spacingDensity === "double" ? 180 : 100);

  // Table styling borders
  let tableBorders: any = {};
  if (tableStyle === "grid") {
    tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: primaryColor },
      left: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    };
  } else if (tableStyle === "booktabs") {
    tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 16, color: "1E293B" },
      bottom: { style: BorderStyle.SINGLE, size: 16, color: "1E293B" },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.NONE },
    };
  } else if (tableStyle === "stripe") {
    tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 8, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "E2E8F0" },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "F1F5F9" },
      insideVertical: { style: BorderStyle.NONE },
    };
  } else {
    // faint
    tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "F1F5F9" },
      insideVertical: { style: BorderStyle.NONE },
    };
  }

  // Heading helper builders
  const createHeading1Paragraph = (text: string) => {
    const isCentered = headingStyle === "centered";
    const runOptions: any = {
      bold: true,
      size: heading1Size,
      color: headingStyle === "centered" ? "1E293B" : primaryColor,
      font: fontName,
    };

    let displayText = text;
    if (headingStyle === "leftborder") {
      displayText = "▐  " + text;
    } else if (headingStyle === "italic") {
      runOptions.italics = true;
    }

    return new Paragraph({
      alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: paragraphSpacingBefore * 1.8, after: paragraphSpacingAfter },
      children: [
        new TextRun({
          text: displayText,
          ...runOptions
        })
      ]
    });
  };

  const createHeading2Paragraph = (text: string) => {
    const isCentered = headingStyle === "centered";
    const runOptions: any = {
      bold: true,
      size: heading2Size,
      color: headingStyle === "centered" ? "475569" : secondaryColor,
      font: fontName,
    };

    let displayText = text;
    if (headingStyle === "leftborder") {
      displayText = "▐  " + text;
    } else if (headingStyle === "italic") {
      runOptions.italics = true;
    }

    return new Paragraph({
      alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: paragraphSpacingBefore * 1.2, after: paragraphSpacingAfter * 0.8 },
      children: [
        new TextRun({
          text: displayText,
          ...runOptions
        })
      ]
    });
  };

  const sections: any[] = [];

  // ==========================================
  // COVER PAGE (If option is selected)
  // ==========================================
  if (solution.hasCoverPage) {
    // Page border setup for cover page
    let coverBordersConfig: any = {};
    if (coverBorder === "thin") {
      coverBordersConfig = {
        page: {
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: primaryColor },
            bottom: { style: BorderStyle.SINGLE, size: 8, color: primaryColor },
            left: { style: BorderStyle.SINGLE, size: 8, color: primaryColor },
            right: { style: BorderStyle.SINGLE, size: 8, color: primaryColor },
          }
        }
      };
    } else if (coverBorder === "double") {
      coverBordersConfig = {
        page: {
          borders: {
            top: { style: BorderStyle.DOUBLE, size: 12, color: primaryColor },
            bottom: { style: BorderStyle.DOUBLE, size: 12, color: primaryColor },
            left: { style: BorderStyle.DOUBLE, size: 12, color: primaryColor },
            right: { style: BorderStyle.DOUBLE, size: 12, color: primaryColor },
          }
        }
      };
    }

    sections.push({
      properties: coverBordersConfig,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 300 },
          children: [
            new TextRun({
              text: student.university.toUpperCase(),
              bold: true,
              size: 28,
              color: primaryColor,
              font: fontName
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 600 },
          children: [
            new TextRun({
              text: `${header.courseCode}: ${header.courseName}`,
              bold: true,
              size: 24,
              color: secondaryColor,
              font: fontName
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 200 },
          children: [
            new TextRun({
              text: `ASSIGNMENT NO. ${header.assignmentNo}`,
              bold: true,
              size: 36,
              color: primaryColor,
              font: fontName
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 1200 },
          children: [
            new TextRun({
              text: `Semester: ${header.semester}`,
              italics: true,
              size: 22,
              color: "475569",
              font: fontName
            })
          ]
        }),
        // Student Info Box with Title Row matching preview
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 16, color: primaryColor },
            bottom: { style: BorderStyle.SINGLE, size: 16, color: primaryColor },
            left: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
            right: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "F1F5F9" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  columnSpan: 2,
                  shading: { fill: "F1F5F9" },
                  children: [
                    new Paragraph({
                      spacing: { before: 120, after: 120 },
                      children: [
                        new TextRun({
                          text: " STUDENT CREDENTIALS & ACADEMIC METADATA",
                          bold: true,
                          size: 18,
                          color: "1E293B",
                          font: fontName
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: " Student Name:", bold: true, font: fontName })] })]
                }),
                new TableCell({
                  width: { size: 60, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: ` ${student.studentName}`, font: fontName })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: " Student VU ID:", bold: true, font: fontName })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: ` ${student.studentId}`, font: fontName })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: " Academic Semester:", bold: true, font: fontName })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: ` ${student.semester}`, font: fontName })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: " Submission Due Date:", bold: true, font: fontName })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun({ text: ` ${header.dueDate}`, font: fontName })] })]
                })
              ]
            })
          ]
        }),
        // Explicitly removed the disclaimer paragraph which used to be here
        new Paragraph({ children: [new PageBreak()] })
      ]
    });
  }

  // ==========================================
  // MAIN REPORT SECTION
  // ==========================================
  const mainChildren: any[] = [
    // Subject Heading
    new Paragraph({
      alignment: headingStyle === "centered" ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: `${header.courseCode}: ${header.courseName} - Assignment No. ${header.assignmentNo}`,
          bold: true,
          size: 24,
          color: primaryColor,
          font: fontName
        })
      ]
    }),
    new Paragraph({
      alignment: headingStyle === "centered" ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: 50, after: 300 },
      children: [
        new TextRun({
          text: `Semester: ${header.semester} | Total Marks: ${header.totalMarks} | Due Date: ${header.dueDate}`,
          size: 18,
          color: "64748B",
          font: fontName
        })
      ]
    }),
  ];

  // 1. Introduction & Background Theory
  if (!solution.disabledSections?.intro) {
    mainChildren.push(
      createHeading1Paragraph("1. Introduction & Theoretical Overview"),
      new Paragraph({
        spacing: { after: paragraphSpacingAfter, line: lineSpacing },
        children: [
          new TextRun({
            text: solution.introduction,
            size: bodySize,
            font: fontName
          })
        ]
      })
    );
  }

  // 2. Transmission Error Illustration (Reference Model Box)
  if (!solution.disabledSections?.diagram) {
    mainChildren.push(
      createHeading2Paragraph("Transmission Channel Fault Types (Reference Model)"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: tableStyle === "faint" ? undefined : { fill: "F8FAFC" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 40 },
                    children: [new TextRun({ text: "Single Bit Error", bold: true, size: 18, font: fontName, color: "1E293B" })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 80 },
                    children: [new TextRun({ text: "Only 1 bit flips in transit", size: 14, color: "64748B", font: fontName })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [
                      new TextRun({ text: "Sent: ", font: "Consolas", size: 16, color: "475569" }),
                      ...getMismatchTextRuns("1 1 0 0 1", "1 0 0 0 1", "sent", mismatchHighlight),
                      new TextRun({ text: "\nRecv: ", font: "Consolas", size: 16, color: "475569" }),
                      ...getMismatchTextRuns("1 1 0 0 1", "1 0 0 0 1", "received", mismatchHighlight)
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: tableStyle === "faint" ? undefined : { fill: "FFF1F2" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 40 },
                    children: [new TextRun({ text: "Burst Error (Multi-Bit)", bold: true, size: 18, font: fontName, color: "1E293B" })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 80 },
                    children: [new TextRun({ text: "Multiple bits flip in transit", size: 14, color: "64748B", font: fontName })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 120 },
                    children: [
                      new TextRun({ text: "Sent: ", font: "Consolas", size: 16, color: "475569" }),
                      ...getMismatchTextRuns("1 1 0 0 1", "0 0 0 0 0", "sent", mismatchHighlight),
                      new TextRun({ text: "\nRecv: ", font: "Consolas", size: 16, color: "475569" }),
                      ...getMismatchTextRuns("1 1 0 0 1", "0 0 0 0 0", "received", mismatchHighlight)
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 300 },
        children: [
          new TextRun({ text: "Figure 1.1: Transmission Channel Vector Comparison Model", italics: true, size: 14, color: "64748B", font: fontName })
        ]
      })
    );
  }

  // 3. Question No. 1
  if (!solution.disabledSections?.q1) {
    // Dynamic table headers layout based on table style
    const isMinimalTable = tableStyle === "stripe" || tableStyle === "faint";
    const headShading = isMinimalTable ? undefined : { fill: primaryColor };
    const headTextColor = isMinimalTable ? primaryColor : "FFFFFF";

    const col1Header = solution.q1ColHeaders?.[0] ?? "Sent Message";
    const col2Header = solution.q1ColHeaders?.[1] ?? "Received Message";
    const col3Header = solution.q1ColHeaders?.[2] ?? "Type of Error & Explanation";

    const q1Headers = [
      new TableCell({
        shading: headShading,
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 }, children: [new TextRun({ text: col1Header, bold: true, color: headTextColor, font: fontName, size: 18 })] })]
      }),
      new TableCell({
        shading: headShading,
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 }, children: [new TextRun({ text: col2Header, bold: true, color: headTextColor, font: fontName, size: 18 })] })]
      }),
      new TableCell({
        shading: headShading,
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 }, children: [new TextRun({ text: col3Header, bold: true, color: headTextColor, font: fontName, size: 18 })] })]
      })
    ];

    const q1TableRows = [new TableRow({ children: q1Headers })];

    solution.q1Data.forEach((row, idx) => {
      // Shading based on tableStyle
      let cellShading: any = undefined;
      let errorBg = "F8FAFC";
      if (tableStyle === "stripe") {
        if (idx % 2 === 1) cellShading = { fill: "F8FAFC" };
        errorBg = idx % 2 === 1 ? "F1F5F9" : "F8FAFC";
      } else if (tableStyle === "grid" || tableStyle === "booktabs") {
        if (idx % 2 === 1) cellShading = { fill: "F8FAFC" };
      }

      const errorColor = row.detectedError === "Single bit error" ? "0284C7" : "E11D48";

      // Build character runs with mismatch highlighting options
      const sentRuns = getMismatchTextRuns(row.sentMessage, row.receivedMessage, "sent", mismatchHighlight);
      const receivedRuns = getMismatchTextRuns(row.sentMessage, row.receivedMessage, "received", mismatchHighlight);

      q1TableRows.push(
        new TableRow({
          children: [
            new TableCell({
              shading: cellShading,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, children: sentRuns })]
            }),
            new TableCell({
              shading: cellShading,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, children: receivedRuns })]
            }),
            new TableCell({
              shading: tableStyle === "faint" ? undefined : { fill: errorBg },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 40 },
                  children: [
                    new TextRun({ text: row.detectedError, bold: true, font: fontName, size: 18, color: errorColor })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 40, after: 80 },
                  children: [
                    new TextRun({ text: `Explanation: ${row.explanation}`, size: 16, color: "334155", font: fontName })
                  ]
                })
              ]
            })
          ]
        })
      );
    });

    mainChildren.push(
      createHeading1Paragraph(solution.q1Title ?? "Question No. 1"),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: solution.q1Subtitle ?? "Identify whether the received message exhibits a Single bit error or a Burst error by comparing the sent and received vectors. Provide a descriptive analysis for each observation.",
            italics: true,
            size: bodySize,
            color: "334155",
            font: fontName
          })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: q1TableRows
      })
    );
  }

  // Add PageBreak dynamically if we have both Page 1 elements and Page 2 elements enabled
  const hasPage1Elements = !solution.disabledSections?.intro || !solution.disabledSections?.diagram || !solution.disabledSections?.q1;
  const hasPage2Elements = !solution.disabledSections?.q2 || !solution.disabledSections?.conclusion;

  if (hasPage1Elements && hasPage2Elements) {
    mainChildren.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // 4. Question No. 2
  if (!solution.disabledSections?.q2) {
    const isMinimalTable = tableStyle === "stripe" || tableStyle === "faint";
    const headShading = isMinimalTable ? undefined : { fill: primaryColor };
    const headTextColor = isMinimalTable ? primaryColor : "FFFFFF";

    const q2Col1Header = solution.q2ColHeaders?.[0] ?? "Number of bits to be corrected (t)";
    const q2Col2Header = solution.q2ColHeaders?.[1] ?? "Minimum Hamming Distance (d_min)";

    const q2Headers = [
      new TableCell({
        shading: headShading,
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 }, children: [new TextRun({ text: q2Col1Header, bold: true, color: headTextColor, font: fontName, size: 18 })] })]
      }),
      new TableCell({
        shading: headShading,
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 }, children: [new TextRun({ text: q2Col2Header, bold: true, color: headTextColor, font: fontName, size: 18 })] })]
      })
    ];

    const q2TableRows = [new TableRow({ children: q2Headers })];

    solution.q2Data.forEach((row, idx) => {
      let cellShading: any = undefined;
      if (idx % 2 === 1 && tableStyle !== "faint") {
        cellShading = { fill: "F8FAFC" };
      }

      q2TableRows.push(
        new TableRow({
          children: [
            new TableCell({
              shading: cellShading,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 150, after: 150 },
                  children: [new TextRun({ text: `${row.bitsCorrected} bits`, bold: true, font: fontName, size: 18 })]
                })
              ]
            }),
            new TableCell({
              shading: cellShading,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, after: 120 },
                  children: [
                    new TextRun({ text: "d", font: fontName, size: 18, italics: true }),
                    new TextRun({ text: "min", font: fontName, size: 14, subScript: true, italics: true }),
                    new TextRun({ text: ` = ${row.minHammingDistance}`, font: fontName, size: 18, bold: true, color: primaryColor })
                  ]
                })
              ]
            })
          ]
        })
      );
    });

    mainChildren.push(
      createHeading1Paragraph(solution.q2Title ?? "Question No. 2"),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: solution.q2Subtitle ?? "Using the block coding theorem for Forward Error Correction, fill in the missing minimum Hamming distance (d_min) using the formula:",
            italics: true,
            size: bodySize,
            color: "334155",
            font: fontName
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 150, after: 250 },
        children: [
          new TextRun({ text: "d", font: fontName, italics: true, bold: true, size: 24 }),
          new TextRun({ text: "min", font: fontName, italics: true, bold: true, size: 16, subScript: true }),
          new TextRun({ text: " = 2t + 1", font: fontName, bold: true, size: 24 })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders,
        rows: q2TableRows
      })
    );
  }

  // 5. Conclusion
  if (!solution.disabledSections?.conclusion) {
    mainChildren.push(
      new Paragraph({ spacing: { before: 400 } }),
      createHeading1Paragraph("2. Conclusion & Integrity Declaration"),
      new Paragraph({
        spacing: { after: paragraphSpacingAfter, line: lineSpacing },
        children: [
          new TextRun({
            text: solution.conclusion,
            size: bodySize,
            font: fontName
          })
        ]
      })
      // Removed the redundant student-signature TextRun block that was here!
    );
  }

  sections.push({
    properties: {},
    children: mainChildren
  });

  // Construct Document
  const doc = new Document({
    sections: sections
  });

  // Compile and trigger download
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CS601_Assignment_3_Solution_${solution.styleName.replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
