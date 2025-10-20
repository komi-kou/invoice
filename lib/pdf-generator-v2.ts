import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// スタイルをクリーンアップする関数
function cleanupStyles(element: HTMLElement): void {
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    
    // oklch関数を含むスタイルを標準的な色に変換
    ['backgroundColor', 'color', 'borderColor'].forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value.includes('oklch')) {
        // デフォルトの色に置き換え
        if (prop === 'backgroundColor') {
          htmlEl.style.backgroundColor = '#ffffff';
        } else if (prop === 'color') {
          htmlEl.style.color = '#000000';
        } else if (prop === 'borderColor') {
          htmlEl.style.borderColor = '#e5e7eb';
        }
      }
    });
    
    // bg-foreground, text-backgroundなどのクラスを削除
    htmlEl.classList.remove('bg-foreground', 'text-background');
  });
}

export async function generatePDFv2(elementId: string, filename: string): Promise<void> {
  try {
    // 要素を取得
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`要素が見つかりません: ${elementId}`);
    }

    // 要素をクローン
    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.backgroundColor = '#ffffff';
    document.body.appendChild(clonedElement);

    // スタイルをクリーンアップ
    cleanupStyles(clonedElement);

    // 少し待機（レンダリング完了を待つ）
    await new Promise(resolve => setTimeout(resolve, 100));

    // html2canvasでキャンバスに変換
    const canvas = await html2canvas(clonedElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: clonedElement.scrollWidth,
      windowHeight: clonedElement.scrollHeight,
      ignoreElements: (element) => {
        // oklchを含む要素を無視
        const style = window.getComputedStyle(element);
        return style.backgroundColor?.includes('oklch') || 
               style.color?.includes('oklch') || 
               false;
      }
    });

    // クローンした要素を削除
    document.body.removeChild(clonedElement);

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
  } catch (error) {
    console.error('PDF生成エラー:', error);
    throw error;
  }
}