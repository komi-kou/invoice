import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF(elementId: string, filename: string): Promise<void> {
  try {
    // 要素を取得
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`要素が見つかりません: ${elementId}`);
    }

    // 要素を表示状態にする
    const originalDisplay = window.getComputedStyle(element).display;
    if (originalDisplay === 'none') {
      element.style.display = 'block';
    }

    // 少し待機（レンダリング完了を待つ）
    await new Promise(resolve => setTimeout(resolve, 100));

    // html2canvasでキャンバスに変換
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // PDFの設定
    const imgWidth = 210; // A4の幅（mm）
    const pageHeight = 297; // A4の高さ（mm）
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // PDF作成
    const pdf = new jsPDF('p', 'mm', 'a4');

    if (imgHeight <= pageHeight) {
      // 1ページに収まる場合
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // 複数ページの場合
      let heightLeft = imgHeight;
      let position = 0;

      // 最初のページ
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 残りのページ
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    // PDFをダウンロード
    pdf.save(filename);

    // 元の表示状態に戻す
    if (originalDisplay === 'none') {
      element.style.display = originalDisplay;
    }
  } catch (error) {
    console.error('PDF生成エラー:', error);
    throw error;
  }
}