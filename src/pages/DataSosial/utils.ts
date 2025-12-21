import type { DataSosialGeneric as DataSosial, PaginationMeta } from "@/types/socialData";

// Helper function to format date
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Helper function to format date short
export const formatDateShort = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
};

// Helper function to convert data to CSV
export const convertToCSV = (
  dataArray: DataSosial[], 
  dataType: string,
  formatDateFn: (str: string | null | undefined) => string = formatDate
): string => {
  if (dataArray.length === 0) return '';
  
  let headers: string[] = [];
  let getRowData: (item: DataSosial, index: number) => string[];
  
  if (dataType === 'stunting') {
    headers = ['No', 'NIK', 'Nama', 'Jenis Kelamin', 'Tanggal Lahir', 'Usia (Bulan)', 'Jorong', 'Nama Ibu', 'Nama Ayah', 'Status Stunting', 'Tanggal Pengukuran Terakhir'];
    getRowData = (item, index) => [
      String(index + 1),
      String(item.nik || ''),
      String(item.nama || ''),
      item.jenis_kelamin === 'L' ? 'Laki-laki' : item.jenis_kelamin === 'P' ? 'Perempuan' : '',
      formatDateFn(item.tanggal_lahir as string),
      String(item.usia_bulan || ''),
      String(item.jorong || ''),
      String(item.nama_ibu || ''),
      String(item.nama_ayah || ''),
      String(item.status_stunting || 'Belum Diukur'),
      formatDateFn(item.last_measurement_date as string),
    ];
  } else if (dataType === 'kb') {
    headers = ['No', 'NIK', 'Nama', 'Usia', 'Alamat', 'Jorong', 'Status KB', 'Jenis KB'];
    getRowData = (item, index) => {
      const itemAny = item as any;
      const isKb = itemAny.is_kb || itemAny.jenis_kb;
      return [
        String(index + 1),
        String(item.nik || ''),
        String(item.nama || ''),
        String(itemAny.usia || ''),
        String(item.alamat || ''),
        String(item.jorong || ''),
        isKb ? 'Sudah KB' : 'Belum KB',
        String(itemAny.jenis_kb || '-'),
      ];
    };
  } else {
    headers = ['No', 'NIK', 'Nama', 'Jorong', 'Status', 'Alamat', 'Keterangan'];
    getRowData = (item, index) => [
      String(index + 1),
      String(item.nik || ''),
      String(item.nama || ''),
      String(item.jorong || ''),
      String(item.status || ''),
      String(item.alamat || ''),
      String(item.keterangan || ''),
    ];
  }
  
  const csvRows = [headers.join(',')];
  dataArray.forEach((item, index) => {
    const rowData = getRowData(item, index).map(cell => {
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    });
    csvRows.push(rowData.join(','));
  });
  
  return csvRows.join('\n');
};

// Generate elegant PDF HTML
export const generatePdfHtml = (
  dataArray: DataSosial[], 
  dataType: string, 
  summaryData: any,
  config: { title: string },
  pagination: PaginationMeta
): string => {
  const title = config.title || 'Data';
  const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const total = pagination.total || dataArray.length;
  const year = new Date().getFullYear();
  
  // Get status summary for header
  let statusSummaryHtml = '';
  if (dataType === 'stunting') {
    const normal = dataArray.filter(d => d.status_stunting === 'Normal').length;
    const ringan = dataArray.filter(d => d.status_stunting === 'Stunting Ringan').length;
    const berat = dataArray.filter(d => d.status_stunting === 'Stunting Berat').length;
    const belum = dataArray.filter(d => !d.status_stunting || d.status_stunting === 'Belum Diukur').length;
    statusSummaryHtml = '<div class="summary-cards">' +
      '<div class="summary-card green"><span class="count">' + normal + '</span><span class="label">Normal</span></div>' +
      '<div class="summary-card orange"><span class="count">' + ringan + '</span><span class="label">Stunting Ringan</span></div>' +
      '<div class="summary-card red"><span class="count">' + berat + '</span><span class="label">Stunting Berat</span></div>' +
      '<div class="summary-card gray"><span class="count">' + belum + '</span><span class="label">Belum Diukur</span></div>' +
      '</div>';
  } else if (dataType === 'kb' && summaryData) {
    const coverage = summaryData.sudah_kb && summaryData.total_wus ? ((summaryData.sudah_kb / summaryData.total_wus) * 100).toFixed(1) : '0';
    statusSummaryHtml = '<div class="summary-cards">' +
      '<div class="summary-card blue"><span class="count">' + (summaryData.total_wus || total) + '</span><span class="label">Total WUS</span></div>' +
      '<div class="summary-card green"><span class="count">' + (summaryData.sudah_kb || 0) + '</span><span class="label">Sudah KB</span></div>' +
      '<div class="summary-card red"><span class="count">' + (summaryData.belum_kb || 0) + '</span><span class="label">Belum KB</span></div>' +
      '<div class="summary-card purple"><span class="count">' + coverage + '%</span><span class="label">Coverage</span></div>' +
      '</div>';
  }

  // Generate table rows based on type
  let tableHeaders = '';
  let tableRows = '';
  
  if (dataType === 'stunting') {
    tableHeaders = '<th style="width:35px">No</th><th>NIK</th><th>Nama</th><th style="width:35px">JK</th><th>Tgl Lahir</th><th style="width:55px">Usia</th><th>Jorong</th><th>Nama Ibu</th><th style="width:100px">Status</th>';
    tableRows = dataArray.map((item, index) => {
      const status = item.status_stunting || 'Belum Diukur';
      const statusClass = status === 'Normal' ? 'status-normal' 
        : status === 'Stunting Ringan' ? 'status-ringan'
        : status === 'Stunting Berat' ? 'status-berat'
        : 'status-belum';
      const tglLahir = formatDateShort(item.tanggal_lahir as string);
      return '<tr>' +
        '<td class="center">' + (index + 1) + '</td>' +
        '<td class="mono">' + (item.nik || '-') + '</td>' +
        '<td class="bold">' + (item.nama || '-') + '</td>' +
        '<td class="center">' + (item.jenis_kelamin === 'L' ? 'L' : item.jenis_kelamin === 'P' ? 'P' : '-') + '</td>' +
        '<td>' + tglLahir + '</td>' +
        '<td class="center">' + (item.usia_bulan ? item.usia_bulan + ' bln' : '-') + '</td>' +
        '<td>' + (item.jorong || '-') + '</td>' +
        '<td>' + (item.nama_ibu || '-') + '</td>' +
        '<td class="' + statusClass + '">' + status + '</td>' +
        '</tr>';
    }).join('');
  } else if (dataType === 'kb') {
    tableHeaders = '<th style="width:35px">No</th><th>NIK</th><th>Nama</th><th style="width:45px">Usia</th><th>Alamat</th><th>Jorong</th><th style="width:100px">Status KB</th><th>Jenis KB</th>';
    tableRows = dataArray.map((item, index) => {
      const itemAny = item as any;
      const isKb = itemAny.is_kb || itemAny.jenis_kb;
      const statusClass = isKb ? 'status-normal' : 'status-berat';
      return '<tr>' +
        '<td class="center">' + (index + 1) + '</td>' +
        '<td class="mono">' + (item.nik || '-') + '</td>' +
        '<td class="bold">' + (item.nama || '-') + '</td>' +
        '<td class="center">' + (itemAny.usia || '-') + ' th</td>' +
        '<td>' + (item.alamat || '-') + '</td>' +
        '<td>' + (item.jorong || '-') + '</td>' +
        '<td class="' + statusClass + '">' + (isKb ? 'Sudah KB' : 'Belum KB') + '</td>' +
        '<td>' + (itemAny.jenis_kb || '-') + '</td>' +
        '</tr>';
    }).join('');
  } else {
    tableHeaders = '<th style="width:35px">No</th><th>NIK</th><th>Nama</th><th>Alamat</th><th>Jorong</th><th>Status</th><th>Keterangan</th>';
    tableRows = dataArray.map((item, index) => 
      '<tr>' +
        '<td class="center">' + (index + 1) + '</td>' +
        '<td class="mono">' + (item.nik || '-') + '</td>' +
        '<td class="bold">' + (item.nama || '-') + '</td>' +
        '<td>' + (item.alamat || '-') + '</td>' +
        '<td>' + (item.jorong || '-') + '</td>' +
        '<td>' + (item.status || '-') + '</td>' +
        '<td>' + (item.keterangan || '-') + '</td>' +
        '</tr>'
    ).join('');
  }

  const styles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px 30px; color: #1e293b; font-size: 11px; line-height: 1.4; }
    .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3b82f6; }
    .header h1 { font-size: 22px; font-weight: 700; color: #1e40af; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
    .header .org-name { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .header .meta { font-size: 11px; color: #94a3b8; }
    .summary-cards { display: flex; gap: 12px; margin-bottom: 20px; justify-content: center; }
    .summary-card { padding: 12px 20px; border-radius: 8px; text-align: center; min-width: 100px; }
    .summary-card .count { display: block; font-size: 24px; font-weight: 700; }
    .summary-card .label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .summary-card.green { background: #dcfce7; color: #166534; }
    .summary-card.orange { background: #ffedd5; color: #c2410c; }
    .summary-card.red { background: #fee2e2; color: #dc2626; }
    .summary-card.gray { background: #f1f5f9; color: #475569; }
    .summary-card.blue { background: #dbeafe; color: #1e40af; }
    .summary-card.purple { background: #f3e8ff; color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; font-weight: 600; padding: 10px 8px; text-align: left; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tr:nth-child(even) { background-color: #f8fafc; }
    tr:hover { background-color: #f1f5f9; }
    .center { text-align: center; }
    .mono { font-family: 'Courier New', monospace; font-size: 9px; }
    .bold { font-weight: 600; }
    .status-normal { color: #166534; background: #dcfce7; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 9px; }
    .status-ringan { color: #c2410c; background: #ffedd5; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 9px; }
    .status-berat { color: #dc2626; background: #fee2e2; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 9px; }
    .status-belum { color: #475569; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 9px; }
    .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
    @media print { body { padding: 10px; } .summary-cards { page-break-inside: avoid; } tr { page-break-inside: avoid; } }
  `;

  return '<!DOCTYPE html><html><head><title>' + title + '</title><style>' + styles + '</style></head><body>' +
    '<div class="header"><div class="org-name">PEMERINTAH NAGARI</div><h1>' + title + '</h1>' +
    '<div class="meta">Dicetak pada: ' + date + ' | Total Data: ' + total + ' orang</div></div>' +
    statusSummaryHtml +
    '<table><thead><tr>' + tableHeaders + '</tr></thead><tbody>' + tableRows + '</tbody></table>' +
    '<div class="footer"><p>Dokumen ini dicetak secara otomatis dari Sistem Informasi Nagari Terpadu</p>' +
    '<p>© ' + year + ' - Dashboard Nagari</p></div></body></html>';
};

// Get status badge color
export const getStatusBadgeColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    // Kemiskinan
    "Sangat Miskin": "bg-red-500",
    "Miskin": "bg-orange-500",
    "Rentan Miskin": "bg-yellow-500",
    "Hampir Miskin": "bg-blue-500",
    // Stunting
    "Stunting Berat": "bg-red-500",
    "Stunting Ringan": "bg-orange-500",
    "Normal": "bg-green-500",
    "Dalam Pemantauan": "bg-blue-500",
    "Belum Diukur": "bg-gray-400",
    // KB
    "Aktif": "bg-green-500",
    "Drop Out": "bg-red-500",
    "Tidak Aktif": "bg-gray-500",
    "Hamil": "bg-purple-500",
    "Sudah KB": "bg-green-500",
    "Belum KB": "bg-red-500",
    // Disabilitas
    "Fisik": "bg-blue-500",
    "Intelektual": "bg-purple-500",
    "Mental": "bg-orange-500",
    "Sensorik": "bg-teal-500",
    "Ganda": "bg-red-500",
    // RTLH
    "Sangat Tidak Layak": "bg-red-500",
    "Tidak Layak": "bg-orange-500",
    "Kurang Layak": "bg-yellow-500",
    "Sudah Diperbaiki": "bg-green-500",
    // Putus Sekolah
    "SD": "bg-blue-500",
    "SMP": "bg-purple-500",
    "SMA": "bg-orange-500",
    "Tidak Sekolah": "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

// Get type icon name
export const getTypeIconName = (type: string): string => {
  const icons: Record<string, string> = {
    "kemiskinan": "Users",
    "stunting": "Baby",
    "kb": "Heart",
    "disabilitas": "Accessibility",
    "rtlh": "Home",
    "putus-sekolah": "GraduationCap",
  };
  return icons[type] || "Activity";
};
