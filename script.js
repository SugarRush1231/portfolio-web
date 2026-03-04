/* ═══════════════════════════════════════════════════
   PORTFOLIO JAVASCRIPT
   Video Player, Scroll animations, Navigation effects
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ──────────────────────────────────────────────
    // VIDEO PLAYER SYSTEM
    // ──────────────────────────────────────────────

    function initVideoPlayers() {
        // 모든 .video-player 안의 video 태그를 찾아서 커스텀 플레이어 구성
        const videoPlayers = document.querySelectorAll('.video-player');

        videoPlayers.forEach(playerContainer => {
            const video = playerContainer.querySelector('video');
            if (!video) return;

            // ── 컨트롤 오버레이 생성 ──
            const overlay = document.createElement('div');
            overlay.className = 'video-overlay';

            // 큰 재생 버튼 (가운데)
            const bigPlayBtn = document.createElement('button');
            bigPlayBtn.className = 'video-big-play';
            bigPlayBtn.setAttribute('aria-label', '재생');
            bigPlayBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            `;

            // 컨트롤 바
            const controls = document.createElement('div');
            controls.className = 'video-controls';

            // 재생/일시정지 버튼
            const playPauseBtn = document.createElement('button');
            playPauseBtn.className = 'video-btn video-play-pause';
            playPauseBtn.setAttribute('aria-label', '재생/일시정지');
            playPauseBtn.innerHTML = `
                <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            `;

            // 시간 표시
            const timeDisplay = document.createElement('span');
            timeDisplay.className = 'video-time';
            timeDisplay.textContent = '0:00 / 0:00';

            // 프로그레스 바
            const progressWrap = document.createElement('div');
            progressWrap.className = 'video-progress-wrap';
            const progressBar = document.createElement('div');
            progressBar.className = 'video-progress-bar';
            const progressBuffered = document.createElement('div');
            progressBuffered.className = 'video-progress-buffered';
            const progressPlayed = document.createElement('div');
            progressPlayed.className = 'video-progress-played';
            const progressHandle = document.createElement('div');
            progressHandle.className = 'video-progress-handle';
            progressBar.appendChild(progressBuffered);
            progressBar.appendChild(progressPlayed);
            progressBar.appendChild(progressHandle);
            progressWrap.appendChild(progressBar);

            // 볼륨 컨테이너 (음소거 버튼 + 볼륨 슬라이더)
            const volumeContainer = document.createElement('div');
            volumeContainer.className = 'video-volume-container';

            // 음소거 버튼
            const muteBtn = document.createElement('button');
            muteBtn.className = 'video-btn video-mute';
            muteBtn.setAttribute('aria-label', '음소거');
            muteBtn.innerHTML = `
                <svg class="icon-volume-high" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <svg class="icon-volume-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            `;

            // 볼륨 슬라이더
            const volumeSliderWrap = document.createElement('div');
            volumeSliderWrap.className = 'video-volume-slider-wrap';
            const volumeSliderTrack = document.createElement('div');
            volumeSliderTrack.className = 'video-volume-track';
            const volumeSliderFill = document.createElement('div');
            volumeSliderFill.className = 'video-volume-fill';
            volumeSliderFill.style.width = '100%';
            const volumeSliderHandle = document.createElement('div');
            volumeSliderHandle.className = 'video-volume-handle';
            volumeSliderHandle.style.left = '100%';
            volumeSliderTrack.appendChild(volumeSliderFill);
            volumeSliderTrack.appendChild(volumeSliderHandle);
            volumeSliderWrap.appendChild(volumeSliderTrack);

            volumeContainer.appendChild(muteBtn);
            volumeContainer.appendChild(volumeSliderWrap);

            // 풀스크린 버튼
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'video-btn video-fullscreen';
            fullscreenBtn.setAttribute('aria-label', '전체화면');
            fullscreenBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            `;

            // 컨트롤 바 조립
            controls.appendChild(playPauseBtn);
            controls.appendChild(timeDisplay);
            controls.appendChild(progressWrap);
            controls.appendChild(volumeContainer);
            controls.appendChild(fullscreenBtn);

            // 오버레이에 추가
            overlay.appendChild(bigPlayBtn);
            overlay.appendChild(controls);

            // 플레이어에 오버레이 추가
            playerContainer.appendChild(overlay);

            // ── 상태 변수 ──
            let isPlaying = false;
            let hideControlsTimer = null;
            let isDragging = false;

            // ── 시간 포맷 ──
            function formatTime(seconds) {
                if (isNaN(seconds)) return '0:00';
                const min = Math.floor(seconds / 60);
                const sec = Math.floor(seconds % 60);
                return `${min}:${sec.toString().padStart(2, '0')}`;
            }

            // ── 재생/일시정지 토글 ──
            function togglePlay() {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }

            // ── 재생 상태 업데이트 ──
            function updatePlayState() {
                isPlaying = !video.paused;
                const iconPlay = playPauseBtn.querySelector('.icon-play');
                const iconPause = playPauseBtn.querySelector('.icon-pause');

                if (isPlaying) {
                    iconPlay.style.display = 'none';
                    iconPause.style.display = 'block';
                    bigPlayBtn.classList.add('hidden');
                    playerContainer.classList.add('playing');
                    showControls();
                } else {
                    iconPlay.style.display = 'block';
                    iconPause.style.display = 'none';
                    bigPlayBtn.classList.remove('hidden');
                    playerContainer.classList.remove('playing');
                    showControlsPermanent();
                }
            }

            // ── 프로그레스 바 업데이트 ──
            function updateProgress() {
                if (!isDragging && video.duration) {
                    const percent = (video.currentTime / video.duration) * 100;
                    progressPlayed.style.width = percent + '%';
                    progressHandle.style.left = percent + '%';
                    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
                }
            }

            // ── 버퍼 프로그레스 업데이트 ──
            function updateBuffered() {
                if (video.buffered.length > 0 && video.duration) {
                    const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                    const percent = (bufferedEnd / video.duration) * 100;
                    progressBuffered.style.width = percent + '%';
                }
            }

            // ── 프로그레스 바 클릭/드래그 시크 ──
            function seekToPosition(e) {
                const rect = progressBar.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                video.currentTime = percent * video.duration;
                const percentVal = percent * 100;
                progressPlayed.style.width = percentVal + '%';
                progressHandle.style.left = percentVal + '%';
            }

            progressBar.addEventListener('mousedown', (e) => {
                isDragging = true;
                seekToPosition(e);
                document.addEventListener('mousemove', onDragMove);
                document.addEventListener('mouseup', onDragEnd);
            });

            function onDragMove(e) {
                if (isDragging) {
                    seekToPosition(e);
                }
            }

            function onDragEnd() {
                isDragging = false;
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('mouseup', onDragEnd);
            }

            // 터치 지원
            progressBar.addEventListener('touchstart', (e) => {
                isDragging = true;
                seekToPosition(e.touches[0]);
            }, { passive: true });

            progressBar.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    seekToPosition(e.touches[0]);
                }
            }, { passive: true });

            progressBar.addEventListener('touchend', () => {
                isDragging = false;
            });

            // ── 볼륨 아이콘 업데이트 ──
            let previousVolume = 1;

            function updateVolumeIcon() {
                const iconHigh = muteBtn.querySelector('.icon-volume-high');
                const iconLow = muteBtn.querySelector('.icon-volume-low');
                const iconMuted = muteBtn.querySelector('.icon-muted');
                iconHigh.style.display = 'none';
                iconLow.style.display = 'none';
                iconMuted.style.display = 'none';

                if (video.muted || video.volume === 0) {
                    iconMuted.style.display = 'block';
                } else if (video.volume < 0.5) {
                    iconLow.style.display = 'block';
                } else {
                    iconHigh.style.display = 'block';
                }
            }

            // ── 볼륨 슬라이더 업데이트 ──
            function updateVolumeSlider() {
                const vol = video.muted ? 0 : video.volume;
                volumeSliderFill.style.width = (vol * 100) + '%';
                volumeSliderHandle.style.left = (vol * 100) + '%';
            }

            // ── 음소거 토글 ──
            function toggleMute() {
                if (video.muted || video.volume === 0) {
                    video.muted = false;
                    video.volume = previousVolume > 0 ? previousVolume : 1;
                } else {
                    previousVolume = video.volume;
                    video.muted = true;
                }
                updateVolumeIcon();
                updateVolumeSlider();
            }

            // ── 볼륨 슬라이더 인터랙션 ──
            let isVolumeDragging = false;

            function setVolumeFromPosition(e) {
                const rect = volumeSliderTrack.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                video.volume = percent;
                video.muted = percent === 0;
                volumeSliderFill.style.width = (percent * 100) + '%';
                volumeSliderHandle.style.left = (percent * 100) + '%';
                updateVolumeIcon();
                if (percent > 0) previousVolume = percent;
            }

            volumeSliderTrack.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                isVolumeDragging = true;
                setVolumeFromPosition(e);
                document.addEventListener('mousemove', onVolumeDragMove);
                document.addEventListener('mouseup', onVolumeDragEnd);
            });

            function onVolumeDragMove(e) {
                if (isVolumeDragging) setVolumeFromPosition(e);
            }

            function onVolumeDragEnd() {
                isVolumeDragging = false;
                document.removeEventListener('mousemove', onVolumeDragMove);
                document.removeEventListener('mouseup', onVolumeDragEnd);
            }

            // 볼륨 슬라이더 터치 지원
            volumeSliderTrack.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                isVolumeDragging = true;
                setVolumeFromPosition(e.touches[0]);
            }, { passive: true });

            volumeSliderTrack.addEventListener('touchmove', (e) => {
                if (isVolumeDragging) setVolumeFromPosition(e.touches[0]);
            }, { passive: true });

            volumeSliderTrack.addEventListener('touchend', () => {
                isVolumeDragging = false;
            });

            video.addEventListener('volumechange', () => {
                updateVolumeIcon();
                updateVolumeSlider();
            });

            // ── 풀스크린 토글 ──
            function toggleFullscreen() {
                if (!document.fullscreenElement) {
                    playerContainer.requestFullscreen().catch(err => {
                        console.log('전체화면 전환 실패:', err);
                    });
                } else {
                    document.exitFullscreen();
                }
            }

            // ── 컨트롤 표시/숨기기 ──
            function showControls() {
                overlay.classList.add('show-controls');
                clearTimeout(hideControlsTimer);
                if (isPlaying) {
                    hideControlsTimer = setTimeout(() => {
                        overlay.classList.remove('show-controls');
                    }, 3000);
                }
            }

            function showControlsPermanent() {
                overlay.classList.add('show-controls');
                clearTimeout(hideControlsTimer);
            }

            // ── 이벤트 리스너 ──
            // 클릭으로 재생/일시정지
            overlay.addEventListener('click', (e) => {
                // 컨트롤 바 안의 버튼 클릭은 무시
                if (e.target.closest('.video-controls')) return;
                togglePlay();
            });

            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });

            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMute();
            });

            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullscreen();
            });

            // 비디오 이벤트
            video.addEventListener('play', updatePlayState);
            video.addEventListener('pause', updatePlayState);
            video.addEventListener('timeupdate', updateProgress);
            video.addEventListener('progress', updateBuffered);
            video.addEventListener('ended', () => {
                isPlaying = false;
                updatePlayState();
                // 처음으로 되감기
                video.currentTime = 0;
                progressPlayed.style.width = '0%';
                progressHandle.style.left = '0%';
            });

            video.addEventListener('loadedmetadata', () => {
                timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
            });

            // 마우스 움직임으로 컨트롤 표시
            playerContainer.addEventListener('mousemove', showControls);
            playerContainer.addEventListener('mouseleave', () => {
                if (isPlaying) {
                    hideControlsTimer = setTimeout(() => {
                        overlay.classList.remove('show-controls');
                    }, 1000);
                }
            });

            // 키보드 단축키
            playerContainer.setAttribute('tabindex', '0');
            playerContainer.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case ' ':
                    case 'k':
                        e.preventDefault();
                        togglePlay();
                        break;
                    case 'm':
                        toggleMute();
                        break;
                    case 'f':
                        toggleFullscreen();
                        break;
                    case 'ArrowLeft':
                        video.currentTime = Math.max(0, video.currentTime - 5);
                        showControls();
                        break;
                    case 'ArrowRight':
                        video.currentTime = Math.min(video.duration, video.currentTime + 5);
                        showControls();
                        break;
                }
            });

            // 초기 상태
            showControlsPermanent();
        });
    }

    // ── 스크롤 시 자동재생 (화면에 보일 때 재생, 벗어나면 정지) ──
    function initVideoAutoplay() {
        const videoPlayers = document.querySelectorAll('.video-player');

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (!video) return;

                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    // 화면에 50% 이상 보이면 자동재생
                    if (video.paused && !video.dataset.userPaused) {
                        video.play().catch(() => {
                            // 자동재생 차단된 경우 음소거 후 재생
                            video.muted = true;
                            video.play().catch(() => { });
                            // 음소거 아이콘 업데이트
                            const muteBtn = entry.target.querySelector('.video-mute');
                            if (muteBtn) {
                                const iconVolume = muteBtn.querySelector('.icon-volume');
                                const iconMuted = muteBtn.querySelector('.icon-muted');
                                if (iconVolume) iconVolume.style.display = 'none';
                                if (iconMuted) iconMuted.style.display = 'block';
                            }
                        });
                    }
                } else {
                    // 화면에서 벗어나면 일시정지
                    if (!video.paused) {
                        video.pause();
                        delete video.dataset.userPaused;
                    }
                }
            });
        }, {
            threshold: 0.5
        });

        videoPlayers.forEach(player => videoObserver.observe(player));

        // 사용자가 직접 일시정지한 경우 구분
        document.querySelectorAll('.video-player video').forEach(video => {
            video.addEventListener('pause', () => {
                // IntersectionObserver에 의한 정지가 아닌 경우만 마킹
                const player = video.closest('.video-player');
                const rect = player.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const isVisible = rect.top < viewportHeight && rect.bottom > 0;
                if (isVisible) {
                    video.dataset.userPaused = 'true';
                }
            });
            video.addEventListener('play', () => {
                delete video.dataset.userPaused;
            });
        });
    }

    // ──────────────────────────────────────────────
    // NAVIGATION & SCROLL ANIMATIONS
    // ──────────────────────────────────────────────

    const nav = document.getElementById('nav');
    const projects = document.querySelectorAll('.project');
    const sectionHeaders = document.querySelectorAll('.section-header');
    const aboutContent = document.querySelector('.about-content');
    const contactContent = document.querySelector('.contact-content');

    // ── Navigation scroll effect ──
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    // ── Intersection Observer for scroll animations ──
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    projects.forEach(project => observer.observe(project));
    sectionHeaders.forEach(header => observer.observe(header));
    if (aboutContent) observer.observe(aboutContent);
    if (contactContent) observer.observe(contactContent);

    // ── Cursor Glow Effect (desktop only) ──
    function initCursorGlow() {
        if (window.innerWidth < 768) return;

        const glow = document.createElement('div');
        glow.classList.add('cursor-glow');
        document.body.appendChild(glow);

        let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateGlow() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // ── Smooth scroll for nav links ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 72;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // ── Parallax effect on hero section ──
    const hero = document.querySelector('.hero-content');
    function handleHeroParallax() {
        if (!hero) return;
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        if (scrollY < heroHeight) {
            const opacity = 1 - (scrollY / heroHeight) * 1.2;
            const translateY = scrollY * 0.3;
            hero.style.opacity = Math.max(0, opacity);
            hero.style.transform = `translateY(${translateY}px)`;
        }
    }

    // ── Active nav link highlight ──
    const sections = document.querySelectorAll('section[id]');
    function highlightNavLink() {
        const scrollY = window.scrollY + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (navLink) {
                if (scrollY >= top && scrollY < top + height) {
                    navLink.style.color = '#f0f0f0';
                } else {
                    navLink.style.color = '';
                }
            }
        });
    }

    // ── Staggered animation for project grids ──
    const gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const children = entry.target.children;
                Array.from(children).forEach((child, index) => {
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(30px)';
                    child.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`;
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        });
                    });
                });
                gridObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.project-media-grid').forEach(grid => {
        gridObserver.observe(grid);
    });

    // ── Scroll event throttle ──
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleNavScroll();
                handleHeroParallax();
                highlightNavLink();
                ticking = false;
            });
            ticking = true;
        }
    });

    // ──────────────────────────────────────────────
    // IMAGE LIGHTBOX SYSTEM
    // ──────────────────────────────────────────────

    function initImageLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');
        if (!lightbox || !lightboxImg || !lightboxClose) return;

        // 라이트박스 열기
        function openLightbox(imgSrc) {
            lightboxImg.src = imgSrc;
            lightbox.classList.add('active');
            document.body.classList.add('lightbox-open');
        }

        // 라이트박스 닫기
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.classList.remove('lightbox-open');
            // 트랜지션 후 src 초기화
            setTimeout(() => {
                lightboxImg.src = '';
            }, 400);
        }

        // X 버튼 클릭으로 닫기
        lightboxClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });

        // 확대된 이미지 클릭으로 닫기
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });

        // 배경(오버레이) 클릭으로 닫기
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });

        // 프로젝트 내 모든 이미지에 클릭 이벤트 바인딩
        const projectImages = document.querySelectorAll(
            '.project-media-grid img, .project-media .media-placeholder img, .placeholder-content img'
        );

        projectImages.forEach(img => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openLightbox(img.src);
            });
        });
    }

    // ── Init ──
    handleNavScroll();
    initCursorGlow();
    initVideoPlayers();
    initImageLightbox();

    // ── Page Load Animation ──
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.6s ease';
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });
    });

})();
