import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TableFooter,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

const printStyles = `
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #222; }
    .report-container { width: 100%; }
    .report-header { text-align: left; margin-bottom: 8px; }
    .report-title { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
    .report-sub { font-size: 14px; margin-bottom: 12px; color: #333; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead th { background: #1976d2; color: white; padding: 8px; text-align: left; border: 1px solid #ddd; }
    tbody td { padding: 8px; border: 1px solid #eee; }
    tfoot td { padding: 8px; border-top: 1px solid #ccc; font-size: 12px; }
    .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 12px; }
    .page-break { page-break-after: always; }
  </style>
`;

const ReportManager = forwardRef(function ReportManager(
  { userName: propUserName, userPhone: propUserPhone, coursesData = [], rowsPerPageOptions = [5, 10, 25, 50] },
  ref
) {
  const reportRef = useRef(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] || 10);

  const userFromStorage = (() => {
    try {
      const u = localStorage.getItem("user");
      if (!u) return null;
      return JSON.parse(u);
    } catch (e) {
      return null;
    }
  })();

  const userName = propUserName || userFromStorage?.fullName || "Unknown User";
  const userPhone = propUserPhone || userFromStorage?.phoneNumber || "";

  const columns = [
    { id: "sl", label: "SL" },
    { id: "id", label: "ID" },
    { id: "categoryName", label: "Category Name" },
    { id: "name", label: "Course Name" },
    { id: "instructorName", label: "Instructor" },
    { id: "price", label: "Price" },
    { id: "discountPrice", label: "Discounted Price" },
    { id: "dateCreated", label: "Date Created" },
  ];

  const mapCourseToRow = (course, index) => {
    return {
      SL: index + 1,
      ID: course.id,
      "Category Name": course.categoryName ?? "",
      "Course Name": course.name ?? "",
      Instructor: course.instructorName ?? "",
      Price: course.price != null ? course.price : "",
      "Discounted Price": course.discountPrice != null ? course.discountPrice : "",
      "Date Created": course.dateCreated ? new Date(course.dateCreated).toLocaleString() : "",
    };
  };

  useImperativeHandle(ref, () => ({
    handleExport,
  }));

  async function handleExport(type = "print") {
    try {
      if (type === "print") {
        doPrint();
      } else if (type === "pdf") {
        await doPDF();
      } else if (type === "excel") {
        await doExcel();
      } else if (type === "word") {
        await doWord();
      } else {
        console.warn("Unknown export type:", type);
      }
    } catch (err) {
      console.error("Export error:", err);
      throw err;
    }
  }

  // ✅ Fixed Print function
  function doPrint() {
    const html = buildReportHTML(coursesData);
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) {
      alert("Unable to open print window (popup blocked).");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();

    w.onload = function () {
      w.focus();
      w.print();
    };
  }

  async function doPDF() {
    const { jsPDF } = await import("jspdf");
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.innerHTML = buildReportHTML(coursesData);
    document.body.appendChild(container);

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    await new Promise((resolve, reject) => {
      doc.html(container, {
        callback: function (doc) {
          try {
            doc.save("report.pdf");
            resolve();
          } catch (e) {
            reject(e);
          } finally {
            document.body.removeChild(container);
          }
        },
        x: 10,
        y: 10,
        windowWidth: 1024,
      });
    });
  }

  async function doExcel() {
    const XLSX = await import("xlsx");
    const FileSaver = await import("file-saver");

    const sheetData = coursesData.map((c, idx) => mapCourseToRow(c, idx));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, "report.xlsx");
  }

  async function doWord() {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } = await import("docx");
    const FileSaver = await import("file-saver");

    const headerCells = columns.map(
      (c) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: c.label, bold: true })] })],
          width: { size: 100, type: WidthType.DXA },
        })
    );

    const rows = coursesData.map((course, idx) => {
      const rowValues = mapCourseToRow(course, idx);
      return new TableRow({
        children: Object.values(rowValues).map(
          (val) =>
            new TableCell({
              children: [new Paragraph(String(val ?? ""))],
              width: { size: 100, type: WidthType.DXA },
            })
        ),
      });
    });

    const table = new Table({
      rows: [new TableRow({ children: headerCells }), ...rows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ children: [new TextRun({ text: `Report for: ${userName}`, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: `Phone: ${userPhone}` })] }),
            table,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    FileSaver.saveAs(blob, "report.docx");
  }

  function buildReportHTML(allCourses = []) {
    const rowsHtml = allCourses
      .map((course, idx) => {
        const r = mapCourseToRow(course, idx);
        return `<tr>
          <td>${escapeHtml(r["SL"])}</td>
          <td>${escapeHtml(r["ID"])}</td>
          <td>${escapeHtml(r["Category Name"])}</td>
          <td>${escapeHtml(r["Course Name"])}</td>
          <td>${escapeHtml(r["Instructor"])}</td>
          <td>${escapeHtml(r["Price"])}</td>
          <td>${escapeHtml(r["Discounted Price"])}</td>
          <td>${escapeHtml(r["Date Created"])}</td>
        </tr>`;
      })
      .join("\n");

    const headerHtml = `
      <div class="report-header">
        <div class="report-title">Courses Report</div>
        <div class="report-sub">User: ${escapeHtml(userName)} ${
      userPhone ? `| Phone: ${escapeHtml(userPhone)}` : ""
    }</div>
      </div>
    `;

    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>SL</th><th>ID</th><th>Category Name</th><th>Course Name</th>
            <th>Instructor</th><th>Price</th><th>Discounted Price</th><th>Date Created</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    const footerHtml = `
      <div class="footer">
        <div>Generated: ${new Date().toLocaleString()}</div>
        <div>Rows: ${allCourses.length}</div>
      </div>
    `;

    return `<!doctype html><html><head><meta charset="utf-8">${printStyles}</head><body>
      <div class="report-container">
        ${headerHtml}
        ${tableHtml}
        ${footerHtml}
      </div>
    </body></html>`;
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  const displayedRows = coursesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 2 }}>
      <Paper variant="outlined" ref={reportRef} sx={{ p: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6">Courses Report</Typography>
          <Typography variant="body2">
            User: {userName} {userPhone && <>| Phone: {userPhone}</>}
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                {columns.map((c) => (
                  <TableCell key={c.id} sx={{ color: "#fff", fontWeight: 600 }}>
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRows.map((course, i) => {
                const row = mapCourseToRow(course, page * rowsPerPage + i);
                return (
                  <TableRow key={course.id || i}>
                    {Object.values(row).map((val, idx) => (
                      <TableCell key={idx}>{val}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {displayedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setPage(0);
                        }}
                      >
                        {rowsPerPageOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box>Page {page + 1} of {Math.max(1, Math.ceil(coursesData.length / rowsPerPage))}</Box>
                    <Box>
                      <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                        Prev
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.min(Math.ceil(coursesData.length / rowsPerPage) - 1, p + 1)
                          )
                        }
                        disabled={page >= Math.ceil(coursesData.length / rowsPerPage) - 1}
                      >
                        Next
                      </button>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
});

export default ReportManager;
