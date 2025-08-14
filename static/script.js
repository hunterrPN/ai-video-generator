/**
 * AI Video Generator - Frontend JavaScript
 * Built for Peppo AI Engineering Internship Technical Challenge
 */

class VideoGenerator {
    constructor() {
        this.currentGenerationId = null;
        this.statusInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCharCounter();
        this.showToast('Welcome! Enter a prompt to generate your AI video.', 'info');
    }

    bindEvents() {
        // Main generate button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateVideo();
        });

        // Character counter for prompt input
        document.getElementById('promptInput').addEventListener('input', () => {
            this.updateCharCounter();
        });

        // Example prompt buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.target.getAttribute('data-prompt');
                document.getElementById('promptInput').value = prompt;
                this.updateCharCounter();
                this.showToast('Example prompt loaded!', 'success');
            });
        });

        // Action buttons (will be bound when video is generated)
        this.bindActionButtons();

        // Enter key to generate
        document.getElementById('promptInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateVideo();
            }
        });
    }

    bindActionButtons() {
        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadVideo();
            });
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareVideo();
            });
        }

        // New video button
        const newVideoBtn = document.getElementById('newVideoBtn');
        if (newVideoBtn) {
            newVideoBtn.addEventListener('click', () => {
                this.resetGenerator();
            });
        }

        // Retry button
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.generateVideo();
            });
        }
    }

    updateCharCounter() {
        const promptInput = document.getElementById('promptInput');
        const charCount = document.getElementById('charCount');
        const currentLength = promptInput.value.length;
        charCount.textContent = currentLength;
        
        // Update color based on character count
        if (currentLength > 450) {
            charCount.style.color = 'var(--error-color)';
        } else if (currentLength > 400) {
            charCount.style.color = 'var(--warning-color)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    }

    async generateVideo() {
        const promptInput = document.getElementById('promptInput');
        const durationSelect = document.getElementById('durationSelect');
        const styleSelect = document.getElementById('styleSelect');
        const generateBtn = document.getElementById('generateBtn');

        // Validation
        const prompt = promptInput.value.trim();
        if (!prompt) {
            this.showToast('Please enter a prompt to generate a video.', 'error');
            promptInput.focus();
            return;
        }

        if (prompt.length > 500) {
            this.showToast('Prompt is too long. Please keep it under 500 characters.', 'error');
            return;
        }

        // Disable generate button and show loading
        generateBtn.disabled = true;
        generateBtn.querySelector('.btn-text').style.display = 'none';
        generateBtn.querySelector('.btn-loader').style.display = 'flex';

        try {
            // Prepare request data
            const requestData = {
                prompt: prompt,
                duration: parseInt(durationSelect.value),
                style: styleSelect.value
            };

            // Make API request
            const response = await fetch('/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to start video generation');
            }

            const data = await response.json();
            this.currentGenerationId = data.generation_id;

            // Show result section and start polling
            this.showResultSection(prompt, data.generation_id);
            this.startStatusPolling();

            this.showToast('Video generation started!', 'success');

        } catch (error) {
            console.error('Generation error:', error);
            this.showToast(error.message || 'Failed to generate video. Please try again.', 'error');
            this.resetGenerateButton();
        }
    }

    showResultSection(prompt, generationId) {
        const resultSection = document.getElementById('resultSection');
        const statusContainer = document.getElementById('statusContainer');
        const videoContainer = document.getElementById('videoContainer');
        const errorContainer = document.getElementById('errorContainer');

        // Update prompt and generation ID in status
        document.getElementById('currentPrompt').textContent = prompt;
        document.getElementById('generationId').textContent = generationId;

        // Show result section and status container
        resultSection.style.display = 'block';
        statusContainer.style.display = 'block';
        videoContainer.style.display = 'none';
        errorContainer.style.display = 'none';

        // Reset progress
        this.updateProgress(0, 'Queued...');

        // Scroll to result section
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    startStatusPolling() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }

        this.statusInterval = setInterval(() => {
            this.checkGenerationStatus();
        }, 2000); // Poll every 2 seconds

        // Also check immediately
        this.checkGenerationStatus();
    }

    async checkGenerationStatus() {
        if (!this.currentGenerationId) return;

        try {
            const response = await fetch(`/status/${this.currentGenerationId}`);
            
            if (!response.ok) {
                throw new Error('Failed to check status');
            }

            const data = await response.json();
            
            switch (data.status) {
                case 'queued':
                    this.updateProgress(5, 'Queued for processing...');
                    break;
                    
                case 'processing':
                    this.updateProgress(data.progress, 'Generating video...');
                    break;
                    
                case 'completed':
                    this.updateProgress(100, 'Complete!');
                    this.showCompletedVideo(data.video_url);
                    break;
                    
                case 'failed':
                    this.showError(data.error || 'Video generation failed');
                    break;
            }

        } catch (error) {
            console.error('Status check error:', error);
            // Don't show error toast for status checks, just log
        }
    }

    updateProgress(percentage, statusText) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const statusTextEl = document.getElementById('statusText');

        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
        statusTextEl.textContent = statusText;
    }

    showCompletedVideo(videoUrl) {
        // Stop polling
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // Hide status, show video
        document.getElementById('statusContainer').style.display = 'none';
        document.getElementById('videoContainer').style.display = 'block';
        document.getElementById('errorContainer').style.display = 'none';

        // Set video source
        const video = document.getElementById('generatedVideo');
        const downloadBtn = document.getElementById('downloadBtn');
        
        video.src = videoUrl;
        downloadBtn.href = videoUrl;

        // Reset generate button
        this.resetGenerateButton();

        // Re-bind action buttons (in case this is a retry)
        this.bindActionButtons();

        this.showToast('Video generated successfully!', 'success');
    }

    showError(errorMessage) {
        // Stop polling
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // Show error container
        document.getElementById('statusContainer').style.display = 'none';
        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('errorContainer').style.display = 'block';

        // Update error message
        document.getElementById('errorMessage').textContent = errorMessage;

        // Reset generate button
        this.resetGenerateButton();

        // Re-bind retry button
        this.bindActionButtons();

        this.showToast('Video generation failed. Please try again.', 'error');
    }

    resetGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = false;
        generateBtn.querySelector('.btn-text').style.display = 'inline';
        generateBtn.querySelector('.btn-loader').style.display = 'none';
    }

    resetGenerator() {
        // Stop any ongoing polling
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // Clear current generation
        this.currentGenerationId = null;

        // Hide result section
        document.getElementById('resultSection').style.display = 'none';

        // Clear prompt (optional)
        // document.getElementById('promptInput').value = '';
        // this.updateCharCounter();

        // Reset generate button
        this.resetGenerateButton();

        // Focus prompt input
        document.getElementById('promptInput').focus();

        this.showToast('Ready to generate another video!', 'info');
    }

    async downloadVideo() {
        const video = document.getElementById('generatedVideo');
        const videoUrl = video.src;

        if (!videoUrl) {
            this.showToast('No video available to download.', 'error');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            link.href = videoUrl;
            link.download = `ai-generated-video-${Date.now()}.mp4`;
            link.target = '_blank';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showToast('Download started!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Download failed. You can try right-clicking the video to save.', 'error');
        }
    }

    async shareVideo() {
        const video = document.getElementById('generatedVideo');
        const videoUrl = video.src;

        if (!videoUrl) {
            this.showToast('No video available to share.', 'error');
            return;
        }

        try {
            if (navigator.share) {
                // Use native share API if available
                await navigator.share({
                    title: 'AI Generated Video',
                    text: 'Check out this AI-generated video!',
                    url: videoUrl
                });
                this.showToast('Shared successfully!', 'success');
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(videoUrl);
                this.showToast('Video link copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Share error:', error);
            
            // Final fallback: manual copy
            try {
                const textArea = document.createElement('textarea');
                textArea.value = videoUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('Video link copied to clipboard!', 'success');
            } catch (copyError) {
                this.showToast('Unable to share. Please copy the video URL manually.', 'error');
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        toastMessage.textContent = message;
        
        // Set toast color based on type
        toast.className = 'toast';
        switch (type) {
            case 'success':
                toast.style.borderLeft = '4px solid var(--success-color)';
                break;
            case 'error':
                toast.style.borderLeft = '4px solid var(--error-color)';
                break;
            case 'warning':
                toast.style.borderLeft = '4px solid var(--warning-color)';
                break;
            default:
                toast.style.borderLeft = '4px solid var(--primary-color)';
        }

        // Show toast
        toast.classList.add('show');

        // Hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoGenerator();
});

// Service worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('SW registered'))
            .catch(() => console.log('SW registration failed'));
    });
}