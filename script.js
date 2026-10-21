/* ═══════════════════════════════════════════════════
   PORTFOLIO JAVASCRIPT
   Video Player, Scroll animations, Navigation effects
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    function updateCurrentYear() {
        const year = new Date().getFullYear();
        document.querySelectorAll('[data-current-year]').forEach(element => {
            element.textContent = year;
        });
    }
    updateCurrentYear();
    window.addEventListener('pageshow', updateCurrentYear);
    window.addEventListener('focus', updateCurrentYear);
    document.addEventListener('visibilitychange', updateCurrentYear);
    setInterval(updateCurrentYear, 60000);


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

            // ── 설정 버튼 + 메뉴 ──
            const settingsContainer = document.createElement('div');
            settingsContainer.className = 'video-settings-container';

            const settingsBtn = document.createElement('button');
            settingsBtn.className = 'video-btn video-settings-btn';
            settingsBtn.setAttribute('aria-label', '설정');
            settingsBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            `;

            const settingsMenu = document.createElement('div');
            settingsMenu.className = 'video-settings-menu';

            // 프레임 단위 이동 토글
            const frameOption = document.createElement('div');
            frameOption.className = 'video-settings-option';
            frameOption.innerHTML = `
                <span class="settings-option-label">프레임 단위 이동</span>
                <div class="settings-toggle">
                    <div class="settings-toggle-track">
                        <div class="settings-toggle-thumb"></div>
                    </div>
                </div>
            `;

            settingsMenu.appendChild(frameOption);
            settingsContainer.appendChild(settingsBtn);
            settingsContainer.appendChild(settingsMenu);

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
            controls.appendChild(settingsContainer);
            controls.appendChild(fullscreenBtn);

            // 오버레이에 추가
            overlay.appendChild(bigPlayBtn);
            overlay.appendChild(controls);

            // 플레이어에 오버레이 추가
            playerContainer.appendChild(overlay);
            const loadStatus = document.createElement('span');
            loadStatus.className = 'video-load-status';
            loadStatus.setAttribute('role', 'status');
            loadStatus.hidden = true;
            playerContainer.appendChild(loadStatus);
            video.addEventListener('waiting', () => {
                playerContainer.classList.add('loading');
                loadStatus.textContent = '영상 불러오는 중…';
                loadStatus.hidden = false;
            });
            ['playing', 'pause', 'ended'].forEach(event => {
                video.addEventListener(event, () => {
                    playerContainer.classList.remove('loading');
                    loadStatus.hidden = true;
                });
            });

            // ── 유튜브 스타일 액션 인디케이터 ──
            const actionIndicator = document.createElement('div');
            actionIndicator.className = 'video-action-indicator';
            actionIndicator.innerHTML = `
                <div class="action-icon-wrap">
                    <svg class="action-icon-play" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <svg class="action-icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                </div>
            `;
            overlay.appendChild(actionIndicator);

            // ── 상태 변수 ──
            let isPlaying = false;
            let hideControlsTimer = null;
            let isDragging = false;
            let wasPlayingBeforeDrag = false;
            let frameStepMode = false; // 기본 탐색은 5초 단위, 프레임 이동은 설정에서 선택
            let isSeeking = false; // 시크(이동) 중 상태
            let seekingTimeout = null; // 시크 완료 감지용 타이머
            let hasStarted = false; // 영상이 한 번이라도 재생된 적 있는지

            // ── 설정 메뉴 토글 ──
            let settingsOpen = false;
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                settingsOpen = !settingsOpen;
                settingsMenu.classList.toggle('open', settingsOpen);
                settingsBtn.classList.toggle('active', settingsOpen);
            });

            // 프레임 토글 클릭
            const toggleTrack = frameOption.querySelector('.settings-toggle-track');
            toggleTrack.classList.add('on'); // 초기 상태 ON
            frameOption.addEventListener('click', (e) => {
                e.stopPropagation();
                frameStepMode = !frameStepMode;
                toggleTrack.classList.toggle('on', frameStepMode);
            });

            // 설정 메뉴 외부 클릭 시 닫기
            document.addEventListener('click', (e) => {
                if (settingsOpen && !settingsContainer.contains(e.target)) {
                    settingsOpen = false;
                    settingsMenu.classList.remove('open');
                    settingsBtn.classList.remove('active');
                }
            });

            // ── 시간 포맷 ──
            function formatTime(seconds) {
                if (isNaN(seconds)) return '0:00';
                const min = Math.floor(seconds / 60);
                const sec = Math.floor(seconds % 60);
                return `${min}:${sec.toString().padStart(2, '0')}`;
            }

            // ── 프레임 포맷 (프레임 모드용) ──
            function formatTimeWithFrame(seconds) {
                if (isNaN(seconds)) return '0:00:00';
                const min = Math.floor(seconds / 60);
                const sec = Math.floor(seconds % 60);
                const frame = Math.floor((seconds % 1) * 30); // 30fps 기준
                return `${min}:${sec.toString().padStart(2, '0')}:${frame.toString().padStart(2, '0')}`;
            }

            // ── 유튜브 스타일 액션 인디케이터 표시 ──
            function showActionIndicator(type) {
                const playIcon = actionIndicator.querySelector('.action-icon-play');
                const pauseIcon = actionIndicator.querySelector('.action-icon-pause');
                if (type === 'play') {
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                } else {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                }
                // 애니메이션 리셋 후 재실행
                actionIndicator.classList.remove('show');
                void actionIndicator.offsetWidth; // reflow 트리거
                actionIndicator.classList.add('show');
            }

            // ── 재생/일시정지 토글 ──
            function togglePlay() {
                if (video.paused) {
                    hasStarted = true;
                    bigPlayBtn.classList.add('hidden');
                    showActionIndicator('play');
                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        delete video.dataset.src;
                    }
                    video.play().catch(error => {
                        if (error.name === 'AbortError') return;
                        hasStarted = false;
                        bigPlayBtn.classList.remove('hidden');
                        playerContainer.classList.remove('loading');
                        loadStatus.textContent = '영상을 불러오지 못했습니다. 다시 재생해 주세요.';
                        loadStatus.hidden = false;
                    });
                } else {
                    showActionIndicator('pause');
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
                    // 영상이 한 번도 재생 안 됐으면 빅플레이 표시
                    if (!hasStarted) {
                        bigPlayBtn.classList.remove('hidden');
                    }
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
                    if (frameStepMode && video.paused) {
                        timeDisplay.textContent = `${formatTimeWithFrame(video.currentTime)} / ${formatTime(video.duration)}`;
                    } else {
                        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
                    }
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
                if (!Number.isFinite(video.duration) || video.duration <= 0) return;
                const rect = progressBar.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                video.currentTime = percent * video.duration;
                const percentVal = percent * 100;
                progressPlayed.style.width = percentVal + '%';
                progressHandle.style.left = percentVal + '%';
                timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            }

            progressBar.addEventListener('mousedown', (e) => {
                isDragging = true;
                wasPlayingBeforeDrag = !video.paused;
                if (wasPlayingBeforeDrag) {
                    video.pause();
                }
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
                if (isDragging) {
                    isDragging = false;
                    if (wasPlayingBeforeDrag) {
                        video.play();
                    }
                    wasPlayingBeforeDrag = false;
                }
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('mouseup', onDragEnd);
            }

            // 터치 지원
            progressBar.addEventListener('touchstart', (e) => {
                isDragging = true;
                wasPlayingBeforeDrag = !video.paused;
                if (wasPlayingBeforeDrag) {
                    video.pause();
                }
                seekToPosition(e.touches[0]);
            }, { passive: true });

            progressBar.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    seekToPosition(e.touches[0]);
                }
            }, { passive: true });

            progressBar.addEventListener('touchend', () => {
                if (isDragging) {
                    isDragging = false;
                    if (wasPlayingBeforeDrag) {
                        video.play();
                    }
                    wasPlayingBeforeDrag = false;
                }
            });

            // ── 볼륨 아이콘 업데이트 ──
            let previousVolume = 0.5;

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
                    video.volume = previousVolume > 0 ? previousVolume : 0.5;
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
                video.currentTime = Number(video.dataset.start) || 0;
                progressPlayed.style.width = '0%';
                progressHandle.style.left = '0%';
            });

            video.addEventListener('loadedmetadata', () => {
                timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
                if (video.dataset.start && video.currentTime < Number(video.dataset.start)) video.currentTime = Number(video.dataset.start);
            });

            // 마우스 움직임으로 컨트롤 표시
            playerContainer.addEventListener('mousemove', () => {
                showControls();
                if (isSeeking) {
                    isSeeking = false;
                }
            });
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
                if (e.target !== playerContainer || e.ctrlKey || e.metaKey || e.altKey) return;
                if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !Number.isFinite(video.duration)) return;
                const FRAME_DURATION = 1 / 30; // 30fps 기준 1프레임

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
                        e.preventDefault();
                        isSeeking = true;
                        bigPlayBtn.classList.add('hidden');
                        clearTimeout(seekingTimeout);
                        if (frameStepMode) {
                            const step = e.shiftKey ? FRAME_DURATION * 5 : FRAME_DURATION;
                            if (!video.paused) video.pause();
                            video.currentTime = Math.max(0, video.currentTime - step);
                            timeDisplay.textContent = `${formatTimeWithFrame(video.currentTime)} / ${formatTime(video.duration)}`;
                        } else {
                            video.currentTime = Math.max(0, video.currentTime - 5);
                        }
                        updateProgress();
                        showControls();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        isSeeking = true;
                        bigPlayBtn.classList.add('hidden');
                        clearTimeout(seekingTimeout);
                        if (frameStepMode) {
                            const step = e.shiftKey ? FRAME_DURATION * 5 : FRAME_DURATION;
                            if (!video.paused) video.pause();
                            video.currentTime = Math.min(video.duration, video.currentTime + step);
                            timeDisplay.textContent = `${formatTimeWithFrame(video.currentTime)} / ${formatTime(video.duration)}`;
                        } else {
                            video.currentTime = Math.min(video.duration, video.currentTime + 5);
                        }
                        updateProgress();
                        showControls();
                        break;
                }
            });

            // 초기 상태: 볼륨 50%, 음소거 해제
            video.volume = 0.5;
            video.muted = false;
            previousVolume = 0.5;
            updateVolumeIcon();
            updateVolumeSlider();
            showControlsPermanent();
        });
    }

    // ── 화면 밖으로 나가면 자동 일시정지 (자동 재생은 없음) ──
    function initVideoAutoPause() {
        const videoPlayers = document.querySelectorAll('.video-player');

        const header = document.getElementById('nav');
        function pauseOutsideView() {
            videoPlayers.forEach(player => {
                const video = player.querySelector('video');
                const gallery = player.closest('.work-index');
                if (!video || video.paused || (gallery && gallery.dataset.phase !== 'video')) return;
                const rect = player.getBoundingClientRect();
                const width = Math.max(0, Math.min(window.innerWidth, rect.right) - Math.max(0, rect.left));
                const height = Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(header?.offsetHeight || 0, rect.top));
                if (!rect.width || !rect.height || width * height / (rect.width * rect.height) < 0.2) video.pause();
            });
        }
        window.addEventListener('scroll', pauseOutsideView, { passive: true });
        window.addEventListener('resize', pauseOutsideView);
    }

    // ──────────────────────────────────────────────
    // NAVIGATION & SCROLL ANIMATIONS
    // ──────────────────────────────────────────────

    const nav = document.getElementById('nav');
    // ── Navigation scroll effect ──
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    // ── Active nav link highlight ──
    const sections = document.querySelectorAll('section[id]');
    function highlightNavLink() {
        if (document.body?.classList.contains('gallery-mode')) return;
        const scrollY = window.scrollY + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (navLink) {
                if (scrollY >= top && scrollY < top + height) {
                    navLink.setAttribute('aria-current', 'location');
                } else {
                    navLink.removeAttribute('aria-current');
                }
            }
        });
    }

    // ──────────────────────────────────────────────
    // PROJECT SIDE NAVIGATION
    // ──────────────────────────────────────────────

    const sideNav = document.getElementById('project-side-nav');
    const workSection = document.getElementById('work');
    const projectArticles = document.querySelectorAll('.project[data-project]');
    const sideNavLinks = document.querySelectorAll('.side-nav-link');

    function updateSideNav() {
        if (!sideNav || !workSection) return;

        const scrollY = window.scrollY;
        const workTop = workSection.offsetTop - 100;
        const workBottom = workTop + workSection.offsetHeight;

        // work 섹션 안에 있을 때만 사이드 내비 표시
        if (scrollY >= workTop && scrollY < workBottom) {
            sideNav.classList.add('visible');
        } else {
            sideNav.classList.remove('visible');
            return;
        }

        // 현재 보이는 프로젝트 하이라이트
        let activeProject = null;
        projectArticles.forEach(article => {
            const articleTop = article.offsetTop - 200;
            const articleBottom = articleTop + article.offsetHeight;
            if (scrollY >= articleTop && scrollY < articleBottom) {
                activeProject = article.getAttribute('data-project');
            }
        });

        sideNavLinks.forEach(link => {
            const target = link.getAttribute('data-target');
            if (target === activeProject) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ── Scroll event throttle ──
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleNavScroll();
                highlightNavLink();
                updateSideNav();
                ticking = false;
            });
            ticking = true;
        }
    });

    // 초기 실행
    updateSideNav();
    highlightNavLink();
    window.addEventListener('resize', () => {
        highlightNavLink();
        updateSideNav();
    });

    // ──────────────────────────────────────────────
    // IMAGE LIGHTBOX SYSTEM
    // ──────────────────────────────────────────────

    function initImageLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxVideo = document.getElementById('lightbox-video');
        const lightboxClose = document.getElementById('lightbox-close');
        if (!lightbox || !lightboxImg || !lightboxClose) return;

        if (lightboxVideo) lightboxVideo.volume = 0.5;
        let currentMode = 'image'; // 'image' or 'video'
        let closeTimer = null;
        let previousFocus = null;
        const backgroundState = new Map();

        function focusLightbox() {
            if (!lightbox.classList.contains('active')) {
                previousFocus = document.activeElement;
                Array.from(document.body.children).forEach(element => {
                    if (element === lightbox || element.tagName === 'SCRIPT') return;
                    backgroundState.set(element, element.inert);
                    element.inert = true;
                });
            }
            lightboxClose.focus();
        }

        // 라이트박스 열기 (이미지)
        function openLightbox(imgSrc) {
            if (closeTimer) clearTimeout(closeTimer);
            currentMode = 'image';
            lightboxImg.src = imgSrc;
            lightboxImg.style.display = 'block';
            if (lightboxVideo) {
                lightboxVideo.style.display = 'none';
                lightboxVideo.pause();
                lightboxVideo.removeAttribute('src');
                lightboxVideo.innerHTML = '';
            }
            focusLightbox();
            lightbox.classList.add('active');
            document.body.classList.add('lightbox-open');
        }

        // 라이트박스 열기 (비디오)
        function openVideoLightbox(videoSrc) {
            if (closeTimer) clearTimeout(closeTimer);
            currentMode = 'video';
            if (!lightboxVideo) return;
            lightboxImg.style.display = 'none';
            lightboxVideo.style.display = 'block';
            lightboxVideo.src = videoSrc;
            lightboxVideo.currentTime = 0;
            focusLightbox();
            lightbox.classList.add('active');
            document.body.classList.add('lightbox-open');
            lightboxVideo.play().catch(() => { });
        }

        // 라이트박스 닫기
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.classList.remove('lightbox-open');
            backgroundState.forEach((inert, element) => { element.inert = inert; });
            backgroundState.clear();
            if (previousFocus) previousFocus.focus();
            if (lightboxVideo) {
                lightboxVideo.pause();
            }
            // 트랜지션 후 src 초기화
            if (closeTimer) clearTimeout(closeTimer);
            closeTimer = setTimeout(() => {
                lightboxImg.src = '';
                lightboxImg.style.display = 'block';
                if (lightboxVideo) {
                    lightboxVideo.removeAttribute('src');
                    lightboxVideo.innerHTML = '';
                    lightboxVideo.style.display = 'none';
                }
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

        // 영상 컨트롤 조작은 라이트박스를 닫지 않습니다.
        if (lightboxVideo) {
            lightboxVideo.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // 배경(오버레이) 클릭으로 닫기
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                e.preventDefault();
                closeLightbox();
            }
            if (e.key === 'Tab') {
                const last = currentMode === 'video' && lightboxVideo ? lightboxVideo : lightboxClose;
                if (e.shiftKey && document.activeElement === lightboxClose) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    lightboxClose.focus();
                }
            }
        });

        // 프로젝트 내 모든 이미지에 클릭 이벤트 바인딩
        const projectImages = document.querySelectorAll(
            '.project-media-grid img, .project-media .media-placeholder img, .placeholder-content img'
        );

        projectImages.forEach(img => {
            if (img.closest('.video-preview')) return;
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openLightbox(img.src);
            });
        });

        // 썸네일을 눌렀을 때만 보조 영상을 불러옵니다.
        const clickableVideos = document.querySelectorAll('.video-preview');
        clickableVideos.forEach(video => {
            video.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const videoSrc = video.dataset.videoSrc;
                if (videoSrc) {
                    openVideoLightbox(videoSrc);
                }
            });
        });
    }

    function initMediaProtection() {
        // Deter casual saving; browser-delivered media cannot be made download-proof here.
        document.querySelectorAll('video').forEach(video => video.controlsList?.add('nodownload'));
        document.addEventListener('contextmenu', event => event.preventDefault(), true);
        document.addEventListener('keydown', event => {
            if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 's') event.preventDefault();
        }, true);
        document.addEventListener('dragstart', event => {
            if (event.target.closest('video, img')) event.preventDefault();
        }, true);
    }

    // ── Init ──
    handleNavScroll();
    initVideoPlayers();
    initVideoAutoPause();
    initImageLightbox();
    initMediaProtection();
    initCopyToClipboard();
    initScrollVideos();
    initProjectGallery();
    initPortfolioViews();

    function initFireTypography(title) {
        let video = null, layers = [], frame = 0, active = false;
        function stop() {
            active = false;
            cancelAnimationFrame(frame);
            if (video) video.pause();
            layers.forEach(({ word, canvas }) => { word.classList.remove('fire-ready'); canvas.remove(); });
            layers = [];
        }
        function draw() {
            if (!active) return;
            if (video.readyState >= 2) layers.forEach(({ word, canvas, mask }) => {
                const ctx = canvas.getContext('2d');
                ctx.globalCompositeOperation = 'source-over';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#090604';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Keep the complete flame tips inside the shared two-line letter mask.
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight,
                    0, canvas.height * 0.12, canvas.width, canvas.height * 0.88);
                ctx.globalCompositeOperation = 'destination-in';
                ctx.drawImage(mask, 0, 0);
                word.classList.add('fire-ready');
            });
            frame = requestAnimationFrame(draw);
        }
        return {
            stop,
            prepare() {
                if (!video) {
                    video = document.createElement('video');
                    video.src = 'assets/brand/fire-rising.mp4';
                    video.muted = video.loop = video.playsInline = true;
                }
                video.currentTime = 0;
                video.play().catch(stop);
            },
            show() {
                layers = Array.from(title.querySelectorAll('.project-display-title')).map(word => {
                    const box = word.getBoundingClientRect();
                    const canvas = document.createElement('canvas');
                    const mask = document.createElement('canvas');
                    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
                    canvas.width = mask.width = Math.ceil(box.width * scale);
                    canvas.height = mask.height = Math.ceil(box.height * scale);
                    canvas.className = 'fire-texture';
                    canvas.setAttribute('aria-hidden', 'true');
                    const ctx = mask.getContext('2d');
                    ctx.scale(scale, scale);
                    word.querySelectorAll('.project-display-glyph').forEach(glyph => {
                        const rect = glyph.getBoundingClientRect(), style = getComputedStyle(glyph);
                        ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                        const metrics = ctx.measureText(glyph.textContent);
                        const ascent = metrics.fontBoundingBoxAscent, descent = metrics.fontBoundingBoxDescent;
                        ctx.fillText(glyph.textContent, rect.left - box.left, rect.top - box.top + (rect.height - ascent - descent) / 2 + ascent);
                    });
                    word.appendChild(canvas);
                    return { word, canvas, mask };
                });
                active = true;
                draw();
            },
        };
    }

    function galleryCardFrame(position, gap, frameWidth) {
        const strength = Math.max(0, 1 - Math.abs(position / gap));
        const extra = Math.max(0, frameWidth * .72 - (gap - 20));
        return {
            x: position + Math.max(-1, Math.min(1, position / gap)) * extra / 2,
            width: gap - 20 + extra * strength,
            inset: .18 * (1 - strength),
            strength,
        };
    }

    function initGallerySurface(gallery, cards, redraw) {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
        if (!gl) return null;
        function shader(type, source) {
            const item = gl.createShader(type);
            gl.shaderSource(item, source);
            gl.compileShader(item);
            if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
            return item;
        }
        let program;
        try {
            program = gl.createProgram();
            gl.attachShader(program, shader(gl.VERTEX_SHADER, `
                attribute vec2 point;
                uniform vec2 viewport;
                uniform vec4 frame;
                uniform float angle;
                uniform float energy;
                varying vec2 uv;
                void main() {
                    float localX = (point.x - .5) * frame.z;
                    float x = frame.x + localX * cos(angle);
                    float range = viewport.x * .3125;
                    float across = min(abs(x) / range, 1.);
                    float ease = across < .5 ? 2. * across * across : -1. + (4. - 2. * across) * across;
                    float swell = (1. - ease) * energy * range;
                    float z = -localX * sin(angle) + swell;
                    float projection = 1000. / (1000. - z);
                    vec2 position = vec2(x, (point.y - .5) * frame.w) * projection;
                    gl_Position = vec4(position.x * 2. / viewport.x, -position.y * 2. / viewport.y, 0., 1.);
                    uv = point;
                }`));
            gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
                precision mediump float;
                uniform sampler2D picture;
                uniform float crop;
                uniform float focus;
                uniform float insetY;
                uniform vec2 imageScale;
                varying vec2 uv;
                void main() {
                    vec2 sampleUV = vec2(.5 + (uv.x - .5) * crop, insetY + uv.y * (1. - 2. * insetY));
                    vec4 pixel = texture2D(picture, .5 + (sampleUV - .5) * imageScale);
                    float gray = (pixel.r + pixel.g + pixel.b) / 3.;
                    gl_FragColor = vec4(mix(vec3(gray * .7), pixel.rgb, focus), 1.);
                }`));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
        } catch (error) {
            console.warn('Gallery depth unavailable; keeping image cards.', error);
            return null;
        }
        canvas.className = 'gallery-surface';
        canvas.setAttribute('aria-hidden', 'true');
        gallery.appendChild(canvas);
        const points = [];
        for (let i = 0; i < 20; i++) {
            const left = i / 20, right = (i + 1) / 20;
            points.push(left, 0, right, 0, left, 1, left, 1, right, 0, right, 1);
        }
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        const point = gl.getAttribLocation(program, 'point');
        gl.enableVertexAttribArray(point);
        gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);
        const uniforms = Object.fromEntries(['viewport', 'frame', 'angle', 'energy', 'crop', 'focus', 'insetY', 'imageScale'].map(name => [name, gl.getUniformLocation(program, name)]));
        let lost = false;
        const textures = cards.map(card => {
            const image = card.querySelector('img'), texture = gl.createTexture();
            const entry = { texture, ready: false };
            function upload() {
                if (lost || !image.naturalWidth) return;
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                try {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                } catch (error) {
                    lost = true;
                    gallery.classList.remove('surface-ready');
                    console.warn('Gallery images unavailable for WebGL; keeping image cards.', error);
                    return;
                }
                entry.aspect = image.naturalWidth / image.naturalHeight;
                entry.ready = true;
                requestAnimationFrame(redraw);
            }
            image.addEventListener('load', upload);
            image.loading = 'eager';
            if (image.complete) upload();
            return entry;
        });
        canvas.addEventListener('webglcontextlost', event => {
            event.preventDefault();
            lost = true;
            gallery.classList.remove('surface-ready');
        });
        return {
            render({ width, height, frameWidth, gap, offset, angle, energy, visible }) {
                const ready = !lost && visible && textures.every(item => item.ready);
                gallery.classList.toggle('surface-ready', ready);
                if (!ready) return;
                const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
                if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
                    canvas.width = Math.round(width * ratio);
                    canvas.height = Math.round(height * ratio);
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.uniform2f(uniforms.viewport, width, height);
                gl.uniform1f(uniforms.angle, angle * Math.PI / 180);
                gl.uniform1f(uniforms.energy, energy);
                textures.forEach((item, i) => {
                    const frame = galleryCardFrame(i * gap - offset, gap, frameWidth);
                    gl.bindTexture(gl.TEXTURE_2D, item.texture);
                    gl.uniform2f(uniforms.imageScale, Math.min(1, (16 / 9) / item.aspect), Math.min(1, item.aspect / (16 / 9)));
                    gl.uniform1f(uniforms.crop, frame.width / frameWidth);
                    gl.uniform1f(uniforms.insetY, frame.inset);
                    gl.uniform4f(uniforms.frame, frame.x, 0, frame.width, frameWidth * .5625 * (1 - 2 * frame.inset));
                    gl.uniform1f(uniforms.focus, i === Math.round(offset / gap) ? 1 : 0);
                    gl.drawArrays(gl.TRIANGLES, 0, points.length / 2);
                });
            },
        };
    }

    function initProjectGallery() {
        const gallery = document.querySelector('.work-index');
        if (!gallery) return;
        const cards = Array.from(gallery.querySelectorAll('.work-preview'));
        if (!cards.length) return;
        const counter = document.querySelector('.gallery-caption > span');
        const selection = document.getElementById('gallery-selection');
        const focus = document.getElementById('gallery-focus');
        const title = document.getElementById('gallery-type');
        const fireType = initFireTypography(title);
        const cinema = document.getElementById('gallery-cinema');
        const camera = document.getElementById('gallery-camera');
        const controls = document.getElementById('gallery-controls');
        const details = document.getElementById('gallery-details');
        const status = document.getElementById('gallery-status');
        const back = document.getElementById('gallery-back');
        const previous = document.getElementById('gallery-prev');
        const next = document.getElementById('gallery-next');
        // Card order is the single source for detail navigation, including software projects.
        cards.forEach((card, i) => {
            const project = document.getElementById(card.hash.slice(1));
            const pagination = document.createElement('nav');
            pagination.className = 'project-pagination';
            pagination.setAttribute('aria-label', '작품 탐색');
            [[-1, 'prev', previous], [1, 'next', next]].forEach(([step, direction, button]) => {
                if (!cards[i + step]) return;
                const link = document.createElement('a');
                link.className = `project-step-${direction}`;
                link.href = cards[i + step].hash;
                link.setAttribute('aria-label', button.getAttribute('aria-label'));
                link.appendChild(button.querySelector('svg').cloneNode(true));
                pagination.appendChild(link);
            });
            project.appendChild(pagination);
        });
        const barcode = cards.map((card, i) => {
            const button = document.createElement('button');
            const name = card.querySelector('.work-card-title').textContent.replace('↗', '').trim();
            button.type = 'button';
            button.dataset.workIndex = String(i);
            button.setAttribute('aria-label', `View ${name}`);
            button.setAttribute('title', name);
            return button;
        });
        document.querySelector('.work-barcode')?.replaceChildren(...barcode);
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let index = Math.max(0, cards.findIndex(card => card.hash === window.location.hash));
        let gap = 120;
        let offset = index * gap;
        let phase = 'out';
        let timer = 0;
        let returnPoint = null;
        let media = null;
        let story = null;
        let opening = 0;
        let drag = null;
        let dragged = false;
        let liftFrame = 0, tilt = 0, impulse = 0, lastLiftTime = 0;
        let renderedOffset = offset;
        let surface = null;

        function resetLift() {
            cancelAnimationFrame(liftFrame);
            liftFrame = tilt = impulse = lastLiftTime = 0;
            renderedOffset = offset;
            gallery.classList.remove('wheel-motion');
            gallery.style.setProperty('--card-tilt', '0deg');
        }
        function animateLift(time) {
            if (phase !== 'out' || document.hidden) { resetLift(); return; }
            const step = lastLiftTime ? Math.min((time - lastLiftTime) / 16.67, 3) : 1;
            lastLiftTime = time;
            renderedOffset += (offset - renderedOffset) * (1 - Math.pow(0.92, step));
            impulse += (offset - renderedOffset - impulse) * (1 - Math.pow(0.92, step));
            tilt = -0.4 * Math.max(-1.7, Math.min(1.7, impulse / (500 / 1.7))) * 180 / Math.PI;
            gallery.style.setProperty('--card-tilt', `${tilt}deg`);
            if (phase === 'out') index = Math.max(0, Math.min(cards.length - 1, Math.round(renderedOffset / gap)));
            layout();
            if (Math.abs(offset - renderedOffset) < 0.05 && Math.abs(impulse) < 0.05) { resetLift(); layout(); return; }
            liftFrame = requestAnimationFrame(animateLift);
        }
        function liftCards() {
            gallery.classList.add('wheel-motion');
            if (!liftFrame) liftFrame = requestAnimationFrame(animateLift);
        }

        function updateCounter() {
            if (counter) counter.textContent = `SELECTED WORK — ${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
            if (selection && selection.dataset.index !== String(index)) {
                selection.dataset.index = String(index);
                selection.querySelector('.gallery-selection-hint').textContent = cards[index].dataset.kind === 'software' ? 'SCROLL / DRAG TO EXPLORE · CLICK TO VIEW' : 'SCROLL / DRAG TO EXPLORE · CLICK TO WATCH';
                selection.querySelector('h3').textContent = cards[index].querySelector('.work-card-title').textContent.replace('↗', '').trim();
                selection.querySelector('p').textContent = cards[index].querySelector('.work-card-type').textContent;
                selection.querySelector('.gallery-selection-role').textContent = cards[index].querySelector('.work-card-role').textContent.replace(/^Role\s*/, '').trim();
            }
            previous.disabled = index === 0;
            next.disabled = index === cards.length - 1;
            barcode.forEach((button, i) => {
                button.setAttribute('aria-pressed', String(i === index));
                const influence = Math.max(0, 1 - Math.abs(i - renderedOffset / gap) / 2);
                button.style.setProperty('--index-height', `${14 + Math.min(Math.abs(impulse) / 500, 1) * 30 * influence}px`);
                button.setAttribute('data-open', String(phase !== 'out'));
            });
        }
        function layout() {
            if (!liftFrame) renderedOffset = offset;
            const width = cards[0].offsetWidth;
            if (!width) return;
            cards.forEach((card, i) => {
                const frame = galleryCardFrame(i * gap - renderedOffset, gap, width);
                const x = phase === 'out' ? frame.x : (i - index) * (width + gap);
                card.style.setProperty('--preview-width', `${frame.width}px`);
                card.style.setProperty('--preview-inset', `${frame.inset * 100}%`);
                card.style.transform = `translate3d(${x}px,0,0)`;
                card.classList.toggle('is-current', i === index);
                card.tabIndex = phase === 'out' || i === index ? 0 : -1;
            });
            surface?.render({ width: gallery.clientWidth, height: gallery.clientHeight, frameWidth: width, gap, offset: renderedOffset, angle: tilt * (motion.matches ? 0.5 : 1), energy: Math.min(Math.abs(impulse) / 500, 1) * (motion.matches ? 0.5 : 1), visible: phase === 'out' });
            updateCounter();
        }
        function returnMedia() {
            opening++;
            drag = null;
            resetLift();
            fireType.stop();
            clearTimeout(timer);
            if (story) {
                story.hidden = true;
                story.classList.remove('gallery-story');
                story = null;
            }
            document.body.classList.remove('gallery-playing');
            if (media) {
                media.querySelector('video').pause();
                returnPoint.replaceWith(media);
                media = returnPoint = null;
            }
            cinema.dataset.portrait = 'false';
            cinema.inert = true;
        }
        function collapse(restoreFocus = false, animate = false) {
            fireType.stop();
            if (animate && phase !== 'out' && phase !== 'closing') {
                clearTimeout(timer);
                if (media) media.querySelector('video').pause();
                phase = 'closing';
                gallery.dataset.phase = phase;
                focus.hidden = true;
                cinema.inert = true;
                window.scrollTo({ top: 0, behavior: 'instant' });
                timer = setTimeout(() => collapse(restoreFocus), 650);
                return;
            }
            returnMedia();
            phase = 'out';
            gallery.dataset.phase = phase;
            focus.hidden = controls.hidden = true;
            document.body.classList.remove('gallery-expanded');
            offset = index * gap;
            status.textContent = '';
            layout();
            if (restoreFocus) cards[index].focus({ preventScroll: true });
        }
        function revealVideo() {
            fireType.stop();
            clearTimeout(timer);
            if (!media || phase === 'video') return;
            phase = 'video';
            gallery.dataset.phase = phase;
            focus.hidden = true;
            cinema.inert = false;
            status.textContent = '영상 재생';
            story = document.getElementById(cards[index].hash.slice(1));
            story.hidden = false;
            story.classList.add('gallery-story');
            document.body.classList.add('gallery-playing');
            const video = media.querySelector('video');
            video.volume = 0.5;
            video.muted = false;
            if (document.hidden) { video.pause(); return; }
            video.play().catch(() => {
                if (media && media.querySelector('video') === video) {
                    media.querySelector('.video-big-play').classList.remove('hidden');
                    status.textContent = '재생 버튼을 눌러 영상을 시작해 주세요.';
                }
            });
        }
        function enterCamera() {
            phase = 'camera';
            if (index === 1) {
                gallery.dataset.phase = phase;
                timer = setTimeout(revealVideo, 1100);
                return;
            }
            if (index === 2) {
                gallery.dataset.phase = phase;
                timer = setTimeout(revealVideo, 1000);
                return;
            }
            if (index === 3) {
                gallery.dataset.phase = phase;
                timer = setTimeout(revealVideo, 1900);
                return;
            }
            const glyphs = Array.from(title.querySelectorAll('.project-display-glyph'));
            const preferred = index === 0 ? 'G' : index === 4 ? 'D' : '';
            const letter = glyphs.find(el => preferred && el.textContent.trim() === preferred) || glyphs.find(el => /[OD]/.test(el.textContent)) || glyphs.find(el => el.textContent === 'A') || glyphs[Math.floor(glyphs.length / 2)];
            const box = title.getBoundingClientRect();
            const vector = letter.querySelector('svg[data-portal]');
            const target = (vector || letter).getBoundingClientRect();
            const stem = vector ? Number(vector.dataset.cameraX) : letter.textContent.trim() === 'D' ? 0.55 : letter.textContent === 'A' ? 0.28 : 0.18;
            const x = target.left + target.width * stem - box.left;
            const y = target.top + target.height * (vector ? Number(vector.dataset.cameraY) : 0.55) - box.top;
            // Reach the letter at the 1000px perspective plane before settling at 1120px.
            const dx = (box.width / 2 - x) * 1.12;
            const dy = (box.height / 2 - y) * 1.12;
            camera.style.setProperty('--camera-x', `${dx}px`);
            camera.style.setProperty('--camera-y', `${dy}px`);
            cinema.style.setProperty('--video-x', `${-dx}px`);
            cinema.style.setProperty('--video-y', `${-dy}px`);
            gallery.dataset.phase = phase;
            timer = setTimeout(revealVideo, 1100);
        }
        function showType() {
            phase = 'type';
            focus.hidden = false;
            if (index === 2 && gallery.dataset.cinematic === 'true') fireType.show();
            gallery.dataset.phase = phase;
            timer = setTimeout(enterCamera, index === 1 ? 1450 : 1300);
        }
        function expand(selected, instant = false) {
            if (gallery.hidden) document.querySelector('.nav-link[href="#work"]').click();
            returnMedia();
            index = Math.max(0, Math.min(cards.length - 1, selected));
            const card = cards[index];
            const project = document.getElementById(card.hash.slice(1));
            if (card.dataset.kind === 'software') {
                collapse();
                details.href = card.hash;
                details.click();
                return;
            }
            media = project.querySelector('.main-media');
            returnPoint = document.createComment('Main player returns here when leaving the gallery.');
            media.before(returnPoint);
            cinema.appendChild(media);
            cinema.dataset.portrait = media.classList.contains('shorts-media');
            title.replaceChildren(project.querySelector('.project-display-title').cloneNode(true));
            title.querySelectorAll('svg[data-ink]').forEach((svg, i) => {
                const mask = svg.querySelector('mask');
                if (!mask) return;
                mask.id = `gallery-ink-${i}`;
                svg.querySelector('[mask]').setAttribute('mask', `url(#${mask.id})`);
            });
            if (index === 2 && !instant) fireType.prepare();
            document.getElementById('gallery-project-kind').textContent = card.querySelector('.work-card-type').textContent;
            document.getElementById('gallery-project-credit').textContent = card.querySelector('.work-card-meta').textContent;
            details.href = card.hash;
            phase = 'expand';
            focus.hidden = true;
            controls.hidden = false;
            gallery.dataset.phase = phase;
            // A project click explicitly starts the cinematic sequence; keyboard entry stays still.
            gallery.dataset.cinematic = String(!instant);
            gallery.classList.toggle('instant-motion', instant);
            document.body.classList.add('gallery-expanded');
            document.body.dataset.galleryProject = String(index + 1);
            status.textContent = `${project.querySelector('.project-display-title').getAttribute('aria-label')} — 영상 열기`;
            const video = media.querySelector('video');
            if (video.dataset.src) {
                video.preload = 'auto';
                video.src = video.dataset.src;
                delete video.dataset.src;
                video.load();
            }
            const start = Number(video.dataset.start) || 0;
            if (video.readyState >= 1) video.currentTime = start;
            // Start within the user gesture so later playback is not blocked by autoplay policy.
            video.muted = true;
            const currentOpening = opening;
            video.play().then(() => {
                if (currentOpening === opening && media && media.querySelector('video') === video &&
                    phase !== 'video' && phase !== 'closing') {
                    video.pause();
                    video.currentTime = start;
                }
            }).catch(() => {});
            window.scrollTo({ top: 0, behavior: 'instant' });
            layout();
            showType();
        }
        cards.forEach((card, i) => {
            card.addEventListener('click', event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                event.preventDefault();
                if (dragged) { dragged = false; return; }
                if (phase !== 'out' && index === i) return;
                expand(i, event.detail === 0);
            });
            card.addEventListener('focus', () => {
                if (phase !== 'out' || !card.matches(':focus-visible')) return;
                gallery.classList.add('instant-motion');
                index = i;
                offset = index * gap;
                layout();
            });
        });
        barcode.forEach((button, i) => button.addEventListener('click', event => {
            if (document.body.classList.contains('lightbox-open')) return;
            const viewingProject = gallery.hidden && window.location.hash.startsWith('#project-');
            if (gallery.hidden) document.querySelector('.nav-link[href="#work"]').click();
            if (viewingProject || phase !== 'out') { expand(i, event.detail === 0); return; }
            gallery.classList.toggle('instant-motion', event.detail === 0 || motion.matches);
            index = i;
            offset = index * gap;
            if (event.detail !== 0) liftCards();
            layout();
            window.scrollTo({ top: 0, behavior: 'instant' });
        }));
        gallery.addEventListener('wheel', event => {
            if (event.ctrlKey || phase === 'video' || document.body.classList.contains('lightbox-open')) return;
            event.preventDefault();
            if (phase !== 'out') return;
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (Math.abs(delta) < 3) return;
            gallery.classList.remove('instant-motion');
            const distance = event.deltaMode === 1 ? delta * 16 : event.deltaMode === 2 ? delta * gallery.clientWidth : delta;
            offset = Math.max(0, Math.min((cards.length - 1) * gap, offset + distance * 0.6));
            index = Math.round(offset / gap);
            liftCards();
            layout();
        }, { passive: false });
        gallery.addEventListener('pointerdown', event => {
            if (phase !== 'out' || gallery.hidden || event.button !== 0 || event.target.closest('button, .gallery-details, .gallery-cinema')) return;
            resetLift();
            drag = { x: event.clientX, offset, id: event.pointerId };
            dragged = false;
        });
        gallery.addEventListener('dragstart', event => event.preventDefault());
        gallery.addEventListener('pointermove', event => {
            if (phase !== 'out' || gallery.hidden || !drag || Math.abs(event.clientX - drag.x) < 8) return;
            dragged = true;
            gallery.setPointerCapture(event.pointerId);
            offset = Math.max(0, Math.min((cards.length - 1) * gap, drag.offset - (event.clientX - drag.x)));
            index = Math.round(offset / gap);
            liftCards();
            layout();
        });
        const endDrag = () => { drag = null; };
        gallery.addEventListener('pointerup', endDrag);
        gallery.addEventListener('pointercancel', endDrag);
        back.addEventListener('click', () => collapse(true, true));
        document.getElementById('back-to-top')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' });
        });
        previous.addEventListener('click', event => { if (index > 0) expand(index - 1, event.detail === 0); });
        next.addEventListener('click', event => { if (index < cards.length - 1) expand(index + 1, event.detail === 0); });
        details.addEventListener('click', event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (cards[index].dataset.kind === 'software') return;
            event.preventDefault();
            if (phase !== 'video') revealVideo();
            story.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
        });
        document.querySelectorAll('.project-pagination a').forEach(link => link.addEventListener('click', event => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            const selected = cards.findIndex(card => card.hash === link.hash);
            if (selected < 0) return;
            event.preventDefault();
            expand(selected, event.detail === 0);
        }));
        document.querySelectorAll('a[href="#work"], a[href="#hero"], .nav-link').forEach(link => link.addEventListener('click', (event = {}) => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
            collapse();
        }));
        document.addEventListener('keydown', event => {
            if (gallery.hidden || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || document.body.classList.contains('lightbox-open')) return;
            if (event.key === 'Escape' && phase !== 'out' && !document.fullscreenElement) {
                event.preventDefault();
                collapse(true, true);
            } else if (!event.target.closest('button, video, .video-player') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                event.preventDefault();
                resetLift();
                index = Math.max(0, Math.min(cards.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
                if (phase === 'out') { gallery.classList.add('instant-motion'); offset = index * gap; layout(); cards[index].focus({ preventScroll: true }); }
                else expand(index, true);
            }
        });
        const resize = () => {
            resetLift();
            gap = Math.max(54, Math.min(100, (gallery.clientWidth || window.innerWidth) * 0.065)) + 20;
            gallery.style.setProperty('--strip-width', `${gap - 20}px`);
            offset = index * gap;
            layout();
        };
        surface = initGallerySurface(gallery, cards, layout);
        new ResizeObserver(() => { if (!gallery.hidden && gallery.clientWidth) resize(); }).observe(gallery);
        window.addEventListener('resize', resize);
        const restoreView = () => {
            const selected = cards.findIndex(card => card.hash === window.location.hash);
            if (selected >= 0) index = selected;
            collapse();
        };
        window.addEventListener('popstate', restoreView);
        window.addEventListener('hashchange', restoreView);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) return;
            resetLift();
            // Tab changes pause playback without closing the project or resetting its position.
            if (phase === 'video') media.querySelector('video').pause();
            else if (phase !== 'out' && phase !== 'closing') revealVideo();
        });
        motion.addEventListener('change', () => {
            if (motion.matches) resetLift();
            if (gallery.dataset.cinematic !== 'true') gallery.classList.toggle('instant-motion', motion.matches);
        });
        resize();
        gallery.dataset.phase = phase;
    }

    function initPortfolioViews() {
        const toolbar = document.getElementById('view-toolbar');
        if (!toolbar) return;
        const panels = Array.from(document.querySelectorAll('.project, #about, #contact'));
        const gallery = document.querySelector('.work-index');
        const hero = document.getElementById('hero');
        const caption = document.querySelector('.gallery-caption');
        const label = document.getElementById('view-label');
        const links = Array.from(document.querySelectorAll('.nav-link'));
        let selectedCard = null;
        document.body.classList.add('gallery-mode');

        function renderView(moveFocus = false, animateType = false) {
            const id = window.location.hash.slice(1);
            const active = panels.find(panel => panel.id === id);
            document.querySelectorAll('video').forEach(video => video.pause());
            panels.forEach(panel => {
                panel.hidden = panel !== active;
                panel.classList.toggle('type-entry', panel === active && animateType);
            });
            gallery.hidden = !!active;
            hero.hidden = !!active;
            caption.hidden = !!active;
            toolbar.hidden = !active;
            document.body.classList.toggle('detail-view', !!active);
            document.body.classList.toggle('gallery-home', !active);
            links.forEach(link => {
                const current = link.hash === (active && !active.classList.contains('project') ? `#${id}` : '#work');
                if (current) link.setAttribute('aria-current', 'page');
                else link.removeAttribute('aria-current');
            });
            label.textContent = active ? active.querySelector('.project-title, .section-title').textContent : '';
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (moveFocus) {
                const target = active ? active.querySelector('.project-title, .section-title') : selectedCard || gallery;
                if (target !== selectedCard) target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        }
        document.addEventListener('click', event => {
            const link = event.target.closest('a[href^="#"]');
            if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            const id = link.hash.slice(1);
            if (!['work', 'hero', ...panels.map(panel => panel.id)].includes(id)) return;
            event.preventDefault();
            if (link.classList.contains('gallery-details')) selectedCard = gallery.querySelector(`.work-preview[href="${link.hash}"]`);
            if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
            renderView(true, event.detail > 0);
        });
        window.addEventListener('popstate', () => renderView(true));
        window.addEventListener('hashchange', () => renderView(true));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !event.defaultPrevented && document.body.classList.contains('detail-view') &&
                !document.body.classList.contains('lightbox-open') && !document.fullscreenElement) {
                window.history.pushState(null, '', '#work');
                renderView(true);
            }
        });
        renderView();
    }

    function initScrollVideos() {
        const visibleVideos = new Set();
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        function updateVideo(video) {
            const shouldPlay = !reducedMotion.matches && visibleVideos.has(video) && !document.hidden &&
                !document.body.classList.contains('lightbox-open') && !video.closest?.('[hidden]');
            if (!shouldPlay) {
                video.pause();
                return;
            }
            if (video.dataset.src) {
                video.src = video.dataset.src;
                delete video.dataset.src;
            }
            video.muted = true;
            video.play().catch(error => {
                if (error.name !== 'AbortError') console.warn('보조 영상 재생 실패:', error);
            });
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                    visibleVideos.add(entry.target);
                } else {
                    visibleVideos.delete(entry.target);
                }
                updateVideo(entry.target);
            });
        }, { threshold: [0, 0.25] });
        document.querySelectorAll('.scroll-play-video').forEach(video => observer.observe(video));
        const updateVisibleVideos = () => visibleVideos.forEach(updateVideo);
        reducedMotion.addEventListener('change', updateVisibleVideos);
        document.addEventListener('visibilitychange', updateVisibleVideos);
        const lightboxObserver = new MutationObserver(updateVisibleVideos);
        lightboxObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    // ──────────────────────────────────────────────
    // COPY TO CLIPBOARD
    // ──────────────────────────────────────────────

    function initCopyToClipboard() {
        const copyLinks = document.querySelectorAll('.contact-link[data-copy]');
        const toast = document.getElementById('copy-toast');
        let toastTimer = null;

        function showToast(copied) {
            if (!toast) return;
            toast.querySelector('span').textContent = copied ? '클립보드에 복사되었습니다!' : '복사하지 못했습니다. 표시된 연락처를 직접 복사해 주세요.';
            toast.querySelector('svg').style.display = copied ? '' : 'none';
            // 이전 타이머 취소
            clearTimeout(toastTimer);
            toast.classList.add('show');
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }

        copyLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const textToCopy = link.getAttribute('data-copy');
                let copied;
                try {
                    if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(textToCopy);
                        copied = true;
                    } else copied = fallbackCopy(textToCopy);
                } catch (_) {
                    copied = fallbackCopy(textToCopy);
                }
                showToast(copied);
            });
        });

        function fallbackCopy(text) {
            const previousFocus = document.activeElement;
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            try {
                textarea.select();
                return document.execCommand('copy');
            } catch (_) {
                return false;
            } finally {
                document.body.removeChild(textarea);
                previousFocus?.focus({ preventScroll: true });
            }
        }
    }

})();
