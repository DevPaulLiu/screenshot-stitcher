class ScreenshotStitcher {
    constructor() {
        this.images = [];
        this.maxImages = 100;
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadSection = document.getElementById('uploadSection');
        this.settingsSection = document.getElementById('settingsSection');
        this.resultSection = document.getElementById('resultSection');
        this.resultCanvas = document.getElementById('resultCanvas');
        this.fullscreenPreview = document.getElementById('fullscreenPreview');
        this.fullscreenImage = document.getElementById('fullscreenImage');
        this.closePreview = document.getElementById('closePreview');
        this.imageCount = document.getElementById('imageCount');
        this.layoutInfo = document.getElementById('layoutInfo');
        this.gapInput = document.getElementById('gapInput');
        this.scaleInput = document.getElementById('scaleInput');
        this.scaleValue = document.getElementById('scaleValue');
        this.stitchBtn = document.getElementById('stitchBtn');
        this.backBtn = document.getElementById('backBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    initEventListeners() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        this.stitchBtn.addEventListener('click', () => this.stitchImages());
        this.backBtn.addEventListener('click', () => this.backToUpload());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.resultCanvas.addEventListener('click', () => this.openFullscreenPreview());
        this.closePreview.addEventListener('click', () => this.closeFullscreenPreview());
        this.fullscreenPreview.addEventListener('click', (e) => {
            if (e.target === this.fullscreenPreview) {
                this.closeFullscreenPreview();
            }
        });

        this.scaleInput.addEventListener('input', (e) => {
            this.scaleValue.textContent = `${e.target.value}x`;
        });
    }

    handleFiles(files) {
        const remainingSlots = this.maxImages - this.images.length;
        const filesToProcess = Math.min(files.length, remainingSlots);

        if (files.length > remainingSlots) {
            const selectedCount = files.length;
            const willAddCount = filesToProcess;
            const willSkipCount = selectedCount - willAddCount;
            alert(`本次选择了${selectedCount}张图片\n\n最多支持${this.maxImages}张图片\n已上传${this.images.length}张\n还能添加${remainingSlots}张\n\n将添加${willAddCount}张，跳过${willSkipCount}张`);
        }

        const fileArray = Array.from(files).slice(0, filesToProcess);
        const loadPromises = fileArray.map(file => {
            if (!file.type.startsWith('image/')) {
                alert(`文件"${file.name}"不是图片格式，已跳过`);
                return Promise.resolve(null);
            }

            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({
                            src: e.target.result,
                            name: file.name,
                            width: img.width,
                            height: img.height
                        });
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(loadPromises).then(loadedImages => {
            const validImages = loadedImages.filter(img => img !== null);
            this.images.push(...validImages);
            this.showSettings();
        });
    }

    calculateLayout(imageCount) {
        const layouts = [
            { cols: 1, rows: imageCount },
            { cols: 2, rows: Math.ceil(imageCount / 2) },
            { cols: 3, rows: Math.ceil(imageCount / 3) },
            { cols: 4, rows: Math.ceil(imageCount / 4) },
            { cols: 5, rows: Math.ceil(imageCount / 5) },
            { cols: 6, rows: Math.ceil(imageCount / 6) },
            { cols: 7, rows: Math.ceil(imageCount / 7) },
            { cols: 8, rows: Math.ceil(imageCount / 8) },
            { cols: 9, rows: Math.ceil(imageCount / 9) },
            { cols: 10, rows: Math.ceil(imageCount / 10) }
        ];

        const firstImage = this.images[0];
        const aspectRatio = firstImage.width / firstImage.height;

        let bestLayout = layouts[0];
        let bestScore = Infinity;

        layouts.forEach(layout => {
            const cellWidth = 300;
            const cellHeight = cellWidth / aspectRatio;
            const totalWidth = layout.cols * cellWidth;
            const totalHeight = layout.rows * cellHeight;
            
            const aspectDiff = Math.abs((totalWidth / totalHeight) - 1);
            const score = aspectDiff;

            if (score < bestScore) {
                bestScore = score;
                bestLayout = layout;
            }
        });

        return bestLayout;
    }

    showSettings() {
        this.imageCount.textContent = this.images.length;
        
        const layout = this.calculateLayout(this.images.length);
        this.layoutInfo.textContent = `${layout.cols}列 × ${layout.rows}行`;
        
        this.uploadSection.style.display = 'none';
        this.settingsSection.style.display = 'block';
        this.resultSection.style.display = 'none';
        
        this.stitchImages();
    }

    backToUpload() {
        this.images = [];
        this.fileInput.value = '';
        this.uploadSection.style.display = 'block';
        this.settingsSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }

    stitchImages() {
        if (this.images.length === 0) {
            alert('请先上传图片');
            return;
        }

        const layout = this.calculateLayout(this.images.length);
        const columns = layout.cols;
        const gap = parseInt(this.gapInput.value) || 10;
        const scale = parseFloat(this.scaleInput.value) || 1;

        const firstImage = this.images[0];
        const aspectRatio = firstImage.width / firstImage.height;
        
        const cellWidth = 800 * scale;
        const cellHeight = cellWidth / aspectRatio;

        const totalWidth = columns * cellWidth + (columns - 1) * gap;
        const totalHeight = layout.rows * cellHeight + (layout.rows - 1) * gap;

        this.resultCanvas.width = totalWidth;
        this.resultCanvas.height = totalHeight;

        const ctx = this.resultCanvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        const loadPromises = this.images.map((image, index) => {
            return new Promise((resolve) => {
                const col = index % columns;
                const row = Math.floor(index / columns);

                const x = col * (cellWidth + gap);
                const y = row * (cellHeight + gap);

                const img = new Image();
                img.onload = () => {
                    resolve({ img, x, y, index });
                };
                img.src = image.src;
            });
        });

        Promise.all(loadPromises).then(results => {
            results.sort((a, b) => a.index - b.index);
            results.forEach(result => {
                ctx.drawImage(result.img, result.x, result.y, cellWidth, cellHeight);
            });
            this.showResult();
        });
    }

    showResult() {
        this.settingsSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    openFullscreenPreview() {
        const dataUrl = this.resultCanvas.toDataURL('image/png', 1.0);
        this.fullscreenImage.src = dataUrl;
        this.fullscreenPreview.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeFullscreenPreview() {
        this.fullscreenPreview.style.display = 'none';
        document.body.style.overflow = '';
    }

    downloadImage() {
        this.resultCanvas.toBlob((blob) => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            
            if (isIOS && navigator.share && navigator.canShare) {
                const file = new File([blob], `screenshot-grid-${Date.now()}.png`, { type: 'image/png' });
                
                if (navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: '截图拼接',
                        text: '保存图片到相册'
                    }).catch((error) => {
                        console.log('分享失败，尝试下载:', error);
                        this.fallbackDownload(blob);
                    });
                } else {
                    this.fallbackDownload(blob);
                }
            } else {
                this.fallbackDownload(blob);
            }
        }, 'image/png', 1.0);
    }

    fallbackDownload(blob) {
        try {
            const fileName = `screenshot-grid-${Date.now()}.png`;
            
            if (typeof saveAs !== 'undefined') {
                saveAs(blob, fileName);
            } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = fileName;
                link.href = url;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('下载失败:', error);
            alert('下载失败，请重试');
        }
    }

    reset() {
        this.images = [];
        this.fileInput.value = '';
        this.uploadSection.style.display = 'block';
        this.settingsSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScreenshotStitcher();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed', err));
    }
});