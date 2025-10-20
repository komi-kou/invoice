import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDFFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    // エレメントを一時的に表示状態にする
    const originalDisplay = element.style.display;
    element.style.display = 'block';
    
    // キャンバスに変換
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          clonedElement.style.display = 'block';
        }
      }
    });
    
    // PDF作成
    const imgWidth = 210; // A4の幅(mm)
    const pageHeight = 297; // A4の高さ(mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    if (imgHeight <= pageHeight) {
      // 1ページに収まる場合
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight
      );
    } else {
      // 複数ページにまたがる場合
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }
    }
    
    // 元の表示状態に戻す
    element.style.display = originalDisplay;
    
    // PDFをダウンロード
    pdf.save(filename);
  } catch (error) {
    console.error('PDF生成エラー:', error);
    throw new Error('PDFの生成に失敗しました。もう一度お試しください。');
  }
}