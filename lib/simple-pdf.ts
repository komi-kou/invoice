export async function createPDF(elementId: string, filename: string): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`要素が見つかりません: ${elementId}`);
    }

    const html2canvas = (await import('html2canvas')).default;
    const { default: jsPDF } = await import('jspdf');

    // スクロール領域全体をキャプチャするための設定
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4サイズの設定（ミリメートル単位）
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);
    
    // キャンバスのアスペクト比を計算
    const imgAspectRatio = canvas.width / canvas.height;
    const pageAspectRatio = contentWidth / contentHeight;
    
    let imgWidthInPdf, imgHeightInPdf;
    
    // コンテンツが1ページに収まるかチェック
    if (imgAspectRatio > pageAspectRatio) {
      // 幅に合わせてスケール
      imgWidthInPdf = contentWidth;
      imgHeightInPdf = contentWidth / imgAspectRatio;
    } else {
      // 高さに合わせてスケール
      imgHeightInPdf = contentHeight;
      imgWidthInPdf = contentHeight * imgAspectRatio;
    }
    
    // 複数ページが必要な場合の処理
    const totalPdfHeight = (canvas.height * imgWidthInPdf) / canvas.width;
    const totalPages = Math.ceil(totalPdfHeight / contentHeight);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    if (totalPages === 1) {
      // 1ページに収まる場合
      const x = (pageWidth - imgWidthInPdf) / 2;
      const y = margin;
      pdf.addImage(imgData, 'PNG', x, y, imgWidthInPdf, imgHeightInPdf);
    } else {
      // 複数ページ必要な場合
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const sourceY = page * (canvas.height / totalPages);
        const sourceHeight = canvas.height / totalPages;
        
        // 各ページごとにキャンバスをスライス
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const ctx = pageCanvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, contentHeight);
        }
      }
    }
    
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF生成エラー:', error);
    alert('PDF生成に失敗しました。もう一度お試しください。');
  }
}