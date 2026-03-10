import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * 导出Excel文件
 * @param {Array} data 表格数据
 * @param {Array} headers 表头配置
 * @param {String} fileName 文件名（不带扩展名）
 * @param {String} sheetName 工作表名
 */
export function exportExcel(data, headers, fileName = '导出数据', sheetName = 'Sheet1') {
  // 1. 准备数据
  const exportData = data.map(item => {
    const row = {}
    headers.forEach(header => {
      row[header.label] = item[header.prop]
    })
    return row
  })

  // 2. 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)
  
  // 3. 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  
  // 4. 生成Excel文件并下载
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${fileName}.xlsx`)
}