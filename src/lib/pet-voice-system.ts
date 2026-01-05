/**
 * Pet Voice System
 * Manages pet voices, sounds, and audio interactions
 */

export type PetVoiceType = 'greeting' | 'happy' | 'sad' | 'excited' | 'calm' | 'concerned' | 'playful' | 'sleepy' | 'proud' | 'encouraging';
export type PetType = 'dog' | 'cat';

export interface PetVoice {
  id: string;
  petType: PetType;
  voiceType: PetVoiceType;
  audioUrl: string;
  duration: number; // in seconds
  description: string;
}

export interface PetSound {
  id: string;
  petType: PetType;
  soundType: 'bark' | 'meow' | 'purr' | 'whine' | 'chirp' | 'snore';
  audioUrl: string;
  duration: number;
}

// Pet voice library - maps to audio files
export const petVoices: PetVoice[] = [
  // Dog (Buddy) voices
  {
    id: 'buddy-greeting',
    petType: 'dog',
    voiceType: 'greeting',
    audioUrl: '/audio/pets/buddy/greeting.mp3',
    duration: 2,
    description: 'Friendly greeting bark'
  },
  {
    id: 'buddy-happy',
    petType: 'dog',
    voiceType: 'happy',
    audioUrl: '/audio/pets/buddy/happy.mp3',
    duration: 2.5,
    description: 'Joyful excited bark'
  },
  {
    id: 'buddy-calm',
    petType: 'dog',
    voiceType: 'calm',
    audioUrl: '/audio/pets/buddy/calm.mp3',
    duration: 2,
    description: 'Soothing calm sound'
  },
  {
    id: 'buddy-encouraging',
    petType: 'dog',
    voiceType: 'encouraging',
    audioUrl: '/audio/pets/buddy/encouraging.mp3',
    duration: 2.5,
    description: 'Motivating supportive bark'
  },
  {
    id: 'buddy-concerned',
    petType: 'dog',
    voiceType: 'concerned',
    audioUrl: '/audio/pets/buddy/concerned.mp3',
    duration: 2,
    description: 'Worried whimper'
  },
  {
    id: 'buddy-playful',
    petType: 'dog',
    voiceType: 'playful',
    audioUrl: '/audio/pets/buddy/playful.mp3',
    duration: 2.5,
    description: 'Playful excited bark'
  },
  {
    id: 'buddy-sleepy',
    petType: 'dog',
    voiceType: 'sleepy',
    audioUrl: '/audio/pets/buddy/sleepy.mp3',
    duration: 2,
    description: 'Sleepy yawn and sigh'
  },
  {
    id: 'buddy-proud',
    petType: 'dog',
    voiceType: 'proud',
    audioUrl: '/audio/pets/buddy/proud.mp3',
    duration: 2.5,
    description: 'Proud triumphant bark'
  },

  // Cat (Whiskers) voices
  {
    id: 'whiskers-greeting',
    petType: 'cat',
    voiceType: 'greeting',
    audioUrl: '/audio/pets/whiskers/greeting.mp3',
    duration: 1.5,
    description: 'Soft greeting meow'
  },
  {
    id: 'whiskers-happy',
    petType: 'cat',
    voiceType: 'happy',
    audioUrl: '/audio/pets/whiskers/happy.mp3',
    duration: 2,
    description: 'Cheerful purring meow'
  },
  {
    id: 'whiskers-calm',
    petType: 'cat',
    voiceType: 'calm',
    audioUrl: '/audio/pets/whiskers/calm.mp3',
    duration: 2.5,
    description: 'Soothing purr'
  },
  {
    id: 'whiskers-encouraging',
    petType: 'cat',
    voiceType: 'encouraging',
    audioUrl: '/audio/pets/whiskers/encouraging.mp3',
    duration: 2,
    description: 'Supportive meow'
  },
  {
    id: 'whiskers-concerned',
    petType: 'cat',
    voiceType: 'concerned',
    audioUrl: '/audio/pets/whiskers/concerned.mp3',
    duration: 1.5,
    description: 'Worried meow'
  },
  {
    id: 'whiskers-playful',
    petType: 'cat',
    voiceType: 'playful',
    audioUrl: '/audio/pets/whiskers/playful.mp3',
    duration: 2,
    description: 'Playful chirp and meow'
  },
  {
    id: 'whiskers-sleepy',
    petType: 'cat',
    voiceType: 'sleepy',
    audioUrl: '/audio/pets/whiskers/sleepy.mp3',
    duration: 2,
    description: 'Sleepy yawn'
  },
  {
    id: 'whiskers-proud',
    petType: 'cat',
    voiceType: 'proud',
    audioUrl: '/audio/pets/whiskers/proud.mp3',
    duration: 1.5,
    description: 'Proud triumphant meow'
  },
];

// Pet sounds
export const petSounds: PetSound[] = [
  // Dog sounds
  { id: 'buddy-bark', petType: 'dog', soundType: 'bark', audioUrl: '/audio/pets/buddy/bark.mp3', duration: 1 },
  { id: 'buddy-whine', petType: 'dog', soundType: 'whine', audioUrl: '/audio/pets/buddy/whine.mp3', duration: 1.5 },
  { id: 'buddy-snore', petType: 'dog', soundType: 'snore', audioUrl: '/audio/pets/buddy/snore.mp3', duration: 2 },

  // Cat sounds
  { id: 'whiskers-meow', petType: 'cat', soundType: 'meow', audioUrl: '/audio/pets/whiskers/meow.mp3', duration: 1 },
  { id: 'whiskers-purr', petType: 'cat', soundType: 'purr', audioUrl: '/audio/pets/whiskers/purr.mp3', duration: 2.5 },
  { id: 'whiskers-chirp', petType: 'cat', soundType: 'chirp', audioUrl: '/audio/pets/whiskers/chirp.mp3', duration: 1 },
];

/**
 * Play a pet voice
 */
export async function playPetVoice(voiceId: string): Promise<void> {
  const voice = petVoices.find(v => v.id === voiceId);
  if (!voice) {
    console.warn(`Voice not found: ${voiceId}`);
    return;
  }

  try {
    const audio = new Audio(voice.audioUrl);
    audio.volume = 0.7; // Set volume to 70%
    await audio.play();
  } catch (error) {
    console.error(`Error playing voice ${voiceId}:`, error);
  }
}

/**
 * Play a pet sound
 */
export async function playPetSound(soundId: string): Promise<void> {
  const sound = petSounds.find(s => s.id === soundId);
  if (!sound) {
    console.warn(`Sound not found: ${soundId}`);
    return;
  }

  try {
    const audio = new Audio(sound.audioUrl);
    audio.volume = 0.5; // Set volume to 50%
    await audio.play();
  } catch (error) {
    console.error(`Error playing sound ${soundId}:`, error);
  }
}

/**
 * Get voice for pet type and mood
 */
export function getVoiceForMood(petType: PetType, mood: string): PetVoice | undefined {
  const moodToVoiceType: Record<string, PetVoiceType> = {
    'joyful': 'happy',
    'happy': 'happy',
    'calm': 'calm',
    'concerned': 'concerned',
    'playful': 'playful',
    'sleepy': 'sleepy',
    'attentive': 'encouraging',
    'proud': 'proud',
    'excited': 'playful',
    'sad': 'concerned',
  };

  const voiceType = moodToVoiceType[mood] || 'calm';
  return petVoices.find(v => v.petType === petType && v.voiceType === voiceType);
}

/**
 * Get random voice for pet type
 */
export function getRandomVoice(petType: PetType): PetVoice | undefined {
  const voices = petVoices.filter(v => v.petType === petType);
  return voices[Math.floor(Math.random() * voices.length)];
}

/**
 * Get random sound for pet type
 */
export function getRandomSound(petType: PetType): PetSound | undefined {
  const sounds = petSounds.filter(s => s.petType === petType);
  return sounds[Math.floor(Math.random() * sounds.length)];
}

/**
 * Play voice with text-to-speech fallback
 */
export async function playPetVoiceWithFallback(
  voiceId: string,
  fallbackText: string,
  petType: PetType
): Promise<void> {
  try {
    await playPetVoice(voiceId);
  } catch (error) {
    console.warn(`Failed to play voice, using text-to-speech fallback`);
    // Fallback to text-to-speech if available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(fallbackText);
      utterance.rate = 0.9;
      utterance.pitch = petType === 'dog' ? 0.8 : 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }
}
