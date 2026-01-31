# Pet Voice Audio Setup Guide

This directory contains audio files for the pet voice system in SAHARA 2.0.

## Directory Structure

```
audio/pets/
├── buddy/          # Dog (Buddy) voice files
│   ├── greeting.mp3
│   ├── happy.mp3
│   ├── calm.mp3
│   ├── encouraging.mp3
│   ├── concerned.mp3
│   ├── playful.mp3
│   ├── sleepy.mp3
│   ├── proud.mp3
│   ├── bark.mp3
│   ├── whine.mp3
│   └── snore.mp3
└── whiskers/       # Cat (Whiskers) voice files
    ├── greeting.mp3
    ├── happy.mp3
    ├── calm.mp3
    ├── encouraging.mp3
    ├── concerned.mp3
    ├── playful.mp3
    ├── sleepy.mp3
    ├── proud.mp3
    ├── meow.mp3
    ├── purr.mp3
    └── chirp.mp3
```

## Audio File Specifications

### Format Requirements
- **Format:** MP3
- **Bitrate:** 128 kbps
- **Sample Rate:** 44.1 kHz
- **Channels:** Mono or Stereo

### Voice Types (8 per pet)

#### Dog (Buddy) - Warm, Friendly, Energetic
1. **greeting.mp3** (2 sec) - Friendly welcome bark
2. **happy.mp3** (2.5 sec) - Joyful excited bark
3. **calm.mp3** (2 sec) - Soothing calm sound
4. **encouraging.mp3** (2.5 sec) - Motivating supportive bark
5. **concerned.mp3** (2 sec) - Worried whimper
6. **playful.mp3** (2.5 sec) - Playful excited bark
7. **sleepy.mp3** (2 sec) - Sleepy yawn and sigh
8. **proud.mp3** (2.5 sec) - Proud triumphant bark

#### Cat (Whiskers) - Soft, Gentle, Mysterious
1. **greeting.mp3** (1.5 sec) - Soft greeting meow
2. **happy.mp3** (2 sec) - Cheerful purring meow
3. **calm.mp3** (2.5 sec) - Soothing purr
4. **encouraging.mp3** (2 sec) - Supportive meow
5. **concerned.mp3** (1.5 sec) - Worried meow
6. **playful.mp3** (2 sec) - Playful chirp and meow
7. **sleepy.mp3** (2 sec) - Sleepy yawn
8. **proud.mp3** (1.5 sec) - Proud triumphant meow

### Sound Effects (3 per pet)

#### Dog (Buddy)
- **bark.mp3** (1 sec) - Excited bark
- **whine.mp3** (1.5 sec) - Worried whimper
- **snore.mp3** (2 sec) - Sleeping snore

#### Cat (Whiskers)
- **meow.mp3** (1 sec) - Regular meow
- **purr.mp3** (2.5 sec) - Contented purring
- **chirp.mp3** (1 sec) - Playful chirp

## How to Create Audio Files

### Option 1: Use Text-to-Speech Services
- **Google Cloud Text-to-Speech** - High quality, multiple voices
- **Azure Speech Services** - Professional quality
- **ElevenLabs** - AI-powered voices
- **Murf.ai** - Character voices

### Option 2: Use AI Voice Generators
- **Bark** (Open source) - Generate dog/cat sounds
- **Jukebox** - Music and sound generation
- **Soundraw** - AI music generator

### Option 3: Record Real Sounds
- Record actual dog/cat sounds
- Use royalty-free pet sound libraries
- Edit and process with Audacity or similar

### Option 4: Use Royalty-Free Libraries
- **Freesound.org** - Community sounds
- **Zapsplat** - Free sound effects
- **BBC Sound Library** - Professional sounds
- **Pixabay Sounds** - Free audio

## Implementation Steps

### Step 1: Prepare Audio Files
1. Create or download audio files matching the specifications above
2. Convert to MP3 format if needed
3. Ensure correct duration and bitrate
4. Test audio quality

### Step 2: Place Files in Directories
```
sahara/public/audio/pets/buddy/
  - greeting.mp3
  - happy.mp3
  - calm.mp3
  - encouraging.mp3
  - concerned.mp3
  - playful.mp3
  - sleepy.mp3
  - proud.mp3
  - bark.mp3
  - whine.mp3
  - snore.mp3

sahara/public/audio/pets/whiskers/
  - greeting.mp3
  - happy.mp3
  - calm.mp3
  - encouraging.mp3
  - concerned.mp3
  - playful.mp3
  - sleepy.mp3
  - proud.mp3
  - meow.mp3
  - purr.mp3
  - chirp.mp3
```

### Step 3: Test Audio Playback
1. Navigate to the pet page
2. Click "Hear [Pet]'s Voice" button
3. Verify audio plays correctly
4. Test all interaction buttons

### Step 4: Optimize Audio
- Compress files to reduce size
- Normalize volume levels
- Add fade in/out effects
- Test on different devices

## Audio Recommendations

### Voice Characteristics

**Dog (Buddy):**
- Pitch: 0.8 (lower)
- Rate: 0.9 (slower)
- Tone: Warm, friendly, energetic
- Personality: Enthusiastic, loyal, playful

**Cat (Whiskers):**
- Pitch: 1.2 (higher)
- Rate: 0.9 (slower)
- Tone: Soft, gentle, mysterious
- Personality: Calm, independent, curious

### Volume Levels
- Voice files: 70% volume
- Sound effects: 50% volume
- Adjust based on user feedback

## Troubleshooting

### Audio Not Playing
1. Check file paths are correct
2. Verify MP3 format and codec
3. Check browser console for errors
4. Test on different browsers
5. Check CORS settings if hosted externally

### Audio Quality Issues
1. Verify bitrate is 128 kbps or higher
2. Check sample rate is 44.1 kHz
3. Normalize audio levels
4. Remove background noise
5. Test on different devices

### Performance Issues
1. Compress audio files
2. Use lower bitrate if needed
3. Implement audio caching
4. Lazy load audio files
5. Monitor network requests

## Testing Checklist

- [ ] All 11 dog voice files present and playable
- [ ] All 11 cat voice files present and playable
- [ ] Audio quality is clear and appropriate
- [ ] Volume levels are consistent
- [ ] Files load quickly
- [ ] No CORS errors
- [ ] Works on mobile devices
- [ ] Works on different browsers
- [ ] Fallback to text-to-speech works
- [ ] Interactions trigger correct sounds

## Next Steps

1. Create or download audio files
2. Place files in correct directories
3. Test audio playback
4. Deploy to production
5. Monitor user feedback
6. Optimize based on feedback

---

**Note:** If audio files are not available, the system will automatically fall back to text-to-speech using the browser's Web Speech API.
