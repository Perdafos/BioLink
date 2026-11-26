import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Copy,
  Share2,
  Instagram,
  Youtube,
  Globe,
  Mail,
  Link2,
  LayoutGrid,
  UserSquare2,
  Paintbrush,
  ChevronDown,
  MoreVertical,
  Upload,
  Palette,
  Undo2,
  Redo2,
  ExternalLink,
  LogOut,
  X,
  QrCode,
  Edit3,
  MessageCircle,
  Music2,
  Loader2,
  ChevronRight,
  BarChart3,
  Users,
  Settings,
  CalendarDays,
  PanelLeft,
  Download,
  Phone,
  Eye,
  EyeOff,
  Briefcase,
  Code2,
  FolderGit2,
  ShoppingBag,
  Sparkles,
  BookOpen,
  Camera,
  Music,
  Gamepad2,
  Heart,
  Star,
  Send,
  FileText,
  Coffee,
  Rocket,
  GripVertical,
} from 'lucide-react';
import { BrandMark } from '../components/atoms/BrandMark';
import { AuthTemplate } from '../components/templates/AuthTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

// --- TYPES & INTERFACES ---

type AppStep = 'login' | 'step-links' | 'step-profile' | 'step-color' | 'transition' | 'dashboard';
type DashboardTab = 'content' | 'header' | 'design';
type DesignPanel = 'menu' | 'theme' | 'wallpaper' | 'buttons' | 'text' | 'colors' | 'stickers' | 'footer';
type DashboardSection =
  | 'overview'
  | 'messaging'
  | 'audience'
  | 'insights'
  | 'discoverability'
  | 'business-cards'
  | 'social-planner'
  | 'instagram-auto-reply'
  | 'link-shortener'
  | 'setup'
  | 'settings';
type HeaderLayoutType = 'classic' | 'hero' | 'banner' | 'shape';
type ProfileShape = 'circle' | 'loop' | 'flower' | 'oval' | 'rounded' | 'burst';
type ButtonVariant = 'solid' | 'outline' | 'soft';
type FontChoice = 'Inter' | 'DM Sans' | 'Plus Jakarta Sans' | 'JetBrains Mono';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
  type?: 'link' | 'group';
  groupId?: string;
  thumbnailUrl?: string;
  iconUrl?: string;
}

interface StickerItem {
  src: string;
  x: number;
  y: number;
  scale: number;
}

interface SocialChannels {
  instagram: string;
  tiktok: string;
  whatsapp: string;
  youtube: string;
  website: string;
  email: string;
}

interface BioPageState {
  accountEmail: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerColor: string;
  bannerUrl: string;
  headerLayout: HeaderLayoutType;
  profileShape: ProfileShape;
  titleColor: string;
  wallpaperColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonVariant: ButtonVariant;
  fontFamily: FontChoice;
  showFooterBadge: boolean;
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
  socials: SocialChannels;
  links: LinkItem[];
  stickers: StickerItem[];
}

interface ProfileSummary {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface AudienceContact {
  id: string;
  email: string;
  created_at: string;
}

// --- SOLID COLOR PALETTES (ZERO GRADIENTS) ---

const WALLPAPER_SWATCHES = [
  { name: 'Pure White', hex: '#FFFFFF', darkText: true },
  { name: 'Sky Tint', hex: '#F0F9FF', darkText: true },
  { name: 'Sky Blue', hex: '#0EA5E9', darkText: false },
  { name: 'Deep Slate', hex: '#434B72', darkText: false },
  { name: 'Steel Blue', hex: '#607784', darkText: false },
  { name: 'Espresso', hex: '#433A31', darkText: false },
  { name: 'Midnight', hex: '#0F172A', darkText: false },
  { name: 'Soft Sand', hex: '#F5DFC6', darkText: true },
  { name: 'Blush Pink', hex: '#F5D5EA', darkText: true },
];

const BUTTON_SWATCHES = [
  { name: 'Sky Blue', bg: '#0EA5E9', text: '#FFFFFF' },
  { name: 'Deep Sky', bg: '#0284C7', text: '#FFFFFF' },
  { name: 'Charcoal', bg: '#18181B', text: '#FFFFFF' },
  { name: 'Pure White', bg: '#FFFFFF', text: '#0F172A' },
  { name: 'Periwinkle', bg: '#7E87B5', text: '#FFFFFF' },
  { name: 'Soft Sky', bg: '#E0F2FE', text: '#0369A1' },
  { name: 'Slate Gray', bg: '#475569', text: '#FFFFFF' },
  { name: 'Warm Stone', bg: '#E7E5E4', text: '#1C1917' },
  { name: 'Obsidian', bg: '#09090B', text: '#FFFFFF' },
];

const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const APP_URL = (
  isLocalHost ? window.location.origin : import.meta.env.VITE_APP_URL || window.location.origin
).replace(/\/$/, '');

const PROFILE_QUERY_USERNAME = new URLSearchParams(window.location.search).get('profile');
const PATH_USERNAME = window.location.pathname === '/'
  ? null
  : decodeURIComponent(window.location.pathname).replace(/^\//, '').replace(/\/$/, '') || null;
const PUBLIC_USERNAME_VALUE = (PROFILE_QUERY_USERNAME || PATH_USERNAME)?.trim();
const PUBLIC_USERNAME = PUBLIC_USERNAME_VALUE ? PUBLIC_USERNAME_VALUE.toLowerCase() : null;

const getPublicProfileUrl = (username: string) =>
  `${APP_URL}/?profile=${encodeURIComponent(username.trim().toLowerCase())}`;

const DEFAULT_AVATAR_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23E2E8F0'/%3E%3Ccircle cx='100' cy='78' r='38' fill='%2394A3B8'/%3E%3Cpath d='M35 185c8-47 31-70 65-70s57 23 65 70' fill='%2394A3B8'/%3E%3C/svg%3E";
const DEFAULT_TITLE = 'Title';
const DEFAULT_BIO_PLACEHOLDER = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
const isCustomTitle = (title: string) =>
  Boolean(title.trim()) && title.trim().toLowerCase() !== DEFAULT_TITLE.toLowerCase();
const isCustomBio = (bio: string) =>
  Boolean(bio.trim()) && bio.trim().toLowerCase() !== DEFAULT_BIO_PLACEHOLDER.toLowerCase();

const INITIAL_STATE: BioPageState = {
  accountEmail: '',
  username: 'john-doe',
  displayName: '',
  bio: '',
  avatarUrl: DEFAULT_AVATAR_URL,
  bannerColor: '#0EA5E9',
  bannerUrl: '',
  headerLayout: 'classic',
  profileShape: 'circle',
  titleColor: '#0F172A',
  wallpaperColor: '#FFFFFF',
  buttonColor: '#0EA5E9',
  buttonTextColor: '#FFFFFF',
  buttonVariant: 'solid',
  fontFamily: 'DM Sans',
  showFooterBadge: true,
  seoTitle: '',
  seoDescription: '',
  noIndex: false,
  socials: {
    instagram: '',
    tiktok: '',
    whatsapp: '',
    youtube: '',
    website: '',
    email: '',
  },
  links: [],
  stickers: [],
};

const LOCAL_SESSION_KEY = 'biolink-local-session';

const sanitizeLegacyProfileValue = (
  value: string,
  kind: 'displayName' | 'username' | 'bio',
) => {
  const normalized = value.trim();
  const legacyText = normalized.toLowerCase();

  if (
    kind === 'displayName' &&
    (legacyText.includes('dafa') ||
      legacyText.includes('ghaitsa') ||
      legacyText.includes('perdafos'))
  ) {
    return 'John Doe';
  }

  if (
    kind === 'username' &&
    (legacyText.includes('dafa') ||
      legacyText.includes('ghaitsa') ||
      legacyText.includes('perdafos'))
  ) {
    return 'john-doe';
  }

  if (
    kind === 'bio' &&
    (legacyText.includes('full-stack web developer') ||
      legacyText.includes('iot enthusiast') ||
      legacyText.includes('membangun produk digital modern') ||
      legacyText === DEFAULT_BIO_PLACEHOLDER.toLowerCase())
  ) {
    return '';
  }

  return value;
};

const getNameFromEmail = (email: string) => {
  const localPart = email.split('@')[0] || 'John Doe';
  const formatted = localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return formatted || 'John Doe';
};

// Helper to determine if background hex is light or dark
function isColorLight(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return true;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

function hasGoodContrast(foreground: string, background: string): boolean {
  const luminance = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return 0;
    const channels = [0, 2, 4].map((offset) => {
      const value = parseInt(clean.substring(offset, offset + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05) >= 3;
}

function getProfileShapeStyle(shape: ProfileShape): React.CSSProperties {
  switch (shape) {
    case 'loop':
      return { borderRadius: '42% 58% 52% 48% / 58% 44% 56% 42%' };
    case 'flower':
      return { borderRadius: '38% 62% 38% 62% / 62% 38% 62% 38%' };
    case 'oval':
      return { borderRadius: '50% / 38%' };
    case 'rounded':
      return { borderRadius: '18%' };
    case 'burst':
      return {
        clipPath:
          'polygon(50% 0%,61% 18%,78% 8%,82% 28%,100% 31%,88% 50%,100% 69%,82% 72%,78% 92%,61% 82%,50% 100%,39% 82%,22% 92%,18% 72%,0% 69%,12% 50%,0% 31%,18% 28%,22% 8%,39% 18%)',
      };
    default:
      return { borderRadius: '50%' };
  }
}

// --- SOLID QR CODE SVG COMPONENT ---

const SolidQRCode: React.FC<{ url: string }> = ({ url }) => (
  <div className="p-4 bg-white border border-slate-200 rounded-2xl inline-block">
    <QRCodeSVG
      value={url}
      size={176}
      level="M"
      bgColor="#FFFFFF"
      fgColor="#0F172A"
      marginSize={2}
      title="QR Code halaman bio"
      className="block"
    />
  </div>
);

const getLinkIconUrl = (link: LinkItem) => {
  if (link.iconUrl?.trim()) return link.iconUrl.trim();
  try {
    const host = new URL(link.url).hostname;
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return null;
  }
};

const getLinkPreviewUrl = (link: LinkItem) => {
  if (link.thumbnailUrl?.trim()) return link.thumbnailUrl.trim();
  try {
    const url = new URL(link.url);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return `https://image.thum.io/get/width/600/crop/900/${encodeURIComponent(url.toString())}`;
  } catch {
    return null;
  }
};

const getLinkPreviewCandidates = (link: LinkItem): string[] => {
  const candidates: string[] = [];
  if (link.thumbnailUrl?.trim()) candidates.push(link.thumbnailUrl.trim());

  try {
    const target = new URL(link.url);
    if (['http:', 'https:'].includes(target.protocol)) {
      candidates.push(
        `https://api.microlink.io/?url=${encodeURIComponent(target.toString())}&screenshot=true&meta=false&embed=screenshot.url`
      );
      candidates.push(
        `https://image.thum.io/get/width/600/crop/900/${encodeURIComponent(target.toString())}`
      );
    }
  } catch {
    return candidates;
  }

  return [...new Set(candidates)];
};

const LinkPreviewImage: React.FC<{
  link: LinkItem;
  className?: string;
  fallbackClassName?: string;
}> = ({ link, className = 'w-full h-32 object-cover', fallbackClassName = 'h-32' }) => {
  const candidates = getLinkPreviewCandidates(link);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(candidates.length === 0);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(candidates.length === 0);
  }, [link.url, link.thumbnailUrl]);

  if (failed || candidates.length === 0) {
    const icon = getLinkIconUrl(link);
    return (
      <div className={`grid place-items-center bg-slate-100 ${fallbackClassName}`}>
        {icon ? (
          <img src={icon} alt="" className="size-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
        ) : (
          <Globe className="size-7 text-slate-400" />
        )}
      </div>
    );
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt={`Preview ${link.title}`}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (candidateIndex + 1 < candidates.length) {
          setCandidateIndex((index) => index + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
};

const normalizeStickers = (value: unknown): StickerItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item === 'string') {
        if (!item.startsWith('http') && !item.startsWith('data:image/')) return null;
        return {
          src: item,
          x: index % 2 === 0 ? 12 : 82,
          y: 14 + (index % 4) * 16,
          scale: 1,
        };
      }
      if (item && typeof item === 'object' && 'src' in item) {
        const sticker = item as { src?: unknown; x?: unknown; y?: unknown; scale?: unknown };
        if (typeof sticker.src !== 'string') return null;
        return {
          src: sticker.src,
          x: typeof sticker.x === 'number' ? Math.max(4, Math.min(96, sticker.x)) : 50,
          y: typeof sticker.y === 'number' ? Math.max(4, Math.min(96, sticker.y)) : 50,
          scale: typeof sticker.scale === 'number' ? Math.max(0.6, Math.min(2, sticker.scale)) : 1,
        };
      }
      return null;
    })
    .filter((item): item is StickerItem => item !== null)
    .slice(0, 8);
};

const OPEN_STICKERS = [
  'https://openstickers.craftwork.design/img/it-1.png',
  'https://openstickers.craftwork.design/img/it-2.png',
  'https://openstickers.craftwork.design/img/it-3.png',
  'https://openstickers.craftwork.design/img/it-4.png',
  'https://openstickers.craftwork.design/img/it-5.png',
  'https://openstickers.craftwork.design/img/nature-1.png',
  'https://openstickers.craftwork.design/img/nature-2.png',
  'https://openstickers.craftwork.design/img/nature-3.png',
  'https://openstickers.craftwork.design/img/life-1.png',
  'https://openstickers.craftwork.design/img/life-2.png',
  'https://openstickers.craftwork.design/img/life-3.png',
  'https://openstickers.craftwork.design/img/life-4.png',
  'https://openstickers.craftwork.design/img/shape-1.png',
  'https://openstickers.craftwork.design/img/shape-2.png',
  'https://openstickers.craftwork.design/img/shape-3.png',
];

const LINK_LUCIDE_ICONS: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  globe: { label: 'Website', icon: Globe },
  briefcase: { label: 'Portfolio', icon: Briefcase },
  code: { label: 'Code', icon: Code2 },
  github: { label: 'Project', icon: FolderGit2 },
  shop: { label: 'Shop', icon: ShoppingBag },
  sparkles: { label: 'Featured', icon: Sparkles },
  book: { label: 'Article', icon: BookOpen },
  camera: { label: 'Photo', icon: Camera },
  music: { label: 'Music', icon: Music },
  game: { label: 'Gaming', icon: Gamepad2 },
  youtube: { label: 'Video', icon: Youtube },
  instagram: { label: 'Instagram', icon: Instagram },
  mail: { label: 'Email', icon: Mail },
  chat: { label: 'Chat', icon: MessageCircle },
  send: { label: 'Contact', icon: Send },
  file: { label: 'Document', icon: FileText },
  coffee: { label: 'Support', icon: Coffee },
  rocket: { label: 'Launch', icon: Rocket },
  star: { label: 'Star', icon: Star },
  heart: { label: 'Favorite', icon: Heart },
};

const renderLinkIcon = (link: LinkItem, sizeClass = 'w-4 h-4') => {
  const value = link.iconUrl?.trim();
  if (value?.startsWith('lucide:')) {
    const key = value.replace('lucide:', '');
    const entry = LINK_LUCIDE_ICONS[key];
    const IconComponent = entry ? entry.icon : Link2;
    return <IconComponent className={sizeClass} />;
  }
  return null;
};

// --- REUSABLE LIVE PHONE PREVIEW COMPONENT ---

const LivePhoneMockup: React.FC<{
  data: BioPageState;
  compact?: boolean;
  skeletonMode?: boolean;
  tilted3D?: boolean;
  onLinkClick?: (id: string) => void;
  onShareLink?: (link: LinkItem) => void;
  onStickerMove?: (index: number, x: number, y: number) => void;
  onStickerScale?: (index: number, scale: number) => void;
  onStickerDelete?: (index: number) => void;
  stickersDraggable?: boolean;
}> = ({
  data,
  compact = false,
  skeletonMode = false,
  tilted3D = false,
  onLinkClick,
  onShareLink,
  onStickerMove,
  onStickerScale,
  onStickerDelete,
  stickersDraggable = false,
}) => {
    const [selectedStickerIndex, setSelectedStickerIndex] = useState<number | null>(null);
    const [expandedPreviewIds, setExpandedPreviewIds] = useState<Record<string, boolean>>({});
    const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({});

    const toggleLinkPreview = (id: string) => {
      setExpandedPreviewIds((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const lightBg = isColorLight(data.wallpaperColor);
    const autoTextColor = lightBg ? '#0F172A' : '#FFFFFF';
    const subTextColor = lightBg ? '#475569' : '#E2E8F0';
    const requestedTitleColor = data.titleColor || autoTextColor;
    const resolvedTitleColor = hasGoodContrast(requestedTitleColor, data.wallpaperColor)
      ? requestedTitleColor
      : autoTextColor;

    const fontClass =
      data.fontFamily === 'JetBrains Mono'
        ? 'font-mono'
        : data.fontFamily === 'Plus Jakarta Sans'
          ? 'font-sans tracking-tight'
          : 'font-sans';

    const activeLinks = data.links.filter((link) => link.active && !link.groupId);

    return (
      <div
        data-live-phone
        onPointerDown={() => {
          if (stickersDraggable) setSelectedStickerIndex(null);
        }}
        style={{
          backgroundColor: data.wallpaperColor,
          transform: tilted3D
            ? 'perspective(1100px) rotateY(-14deg) rotateX(4deg) rotateZ(-2deg)'
            : undefined,
        }}
        className={`relative overflow-hidden transition-all duration-300 select-none ${fontClass} ${compact
          ? 'w-[220px] h-[420px] rounded-[34px] border-[6px] border-neutral-900 shadow-xl'
          : 'w-[325px] sm:w-[345px] min-h-[630px] max-h-[76vh] rounded-[40px] border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)]'
          }`}
      >
        {/* Scrollable Phone Interior */}
        <div className="h-full overflow-y-auto flex flex-col justify-between pb-6">
          {data.stickers.map((sticker, index) => (
            <div
              key={`${sticker.src}-${index}`}
              onPointerDown={(event) => {
                if (!stickersDraggable) return;
                event.preventDefault();
                event.stopPropagation();
                setSelectedStickerIndex(index);
                event.currentTarget.setPointerCapture(event.pointerId);

                const phone = event.currentTarget.closest('[data-live-phone]')?.getBoundingClientRect();
                const stickerRect = event.currentTarget.getBoundingClientRect();
                if (!phone) return;
                event.currentTarget.dataset.dragOffsetX = String(
                  event.clientX - (stickerRect.left + stickerRect.width / 2)
                );
                event.currentTarget.dataset.dragOffsetY = String(
                  event.clientY - (stickerRect.top + stickerRect.height / 2)
                );
              }}
              onPointerMove={(event) => {
                if (!stickersDraggable || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const phone = event.currentTarget.closest('[data-live-phone]')?.getBoundingClientRect();
                if (!phone) return;
                const offsetX = Number(event.currentTarget.dataset.dragOffsetX || 0);
                const offsetY = Number(event.currentTarget.dataset.dragOffsetY || 0);
                const centerX = event.clientX - offsetX;
                const centerY = event.clientY - offsetY;
                const x = ((centerX - phone.left) / phone.width) * 100;
                const y = ((centerY - phone.top) / phone.height) * 100;
                onStickerMove?.(
                  index,
                  Math.max(4, Math.min(96, x)),
                  Math.max(4, Math.min(96, y))
                );
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              className={`absolute z-20 grid size-12 place-items-center ${stickersDraggable ? 'cursor-grab touch-none active:cursor-grabbing' : 'pointer-events-none'
                }`}
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: `translate(-50%, -50%) scale(${sticker.scale})`,
              }}
            >
              {sticker.src.startsWith('data:image/') || sticker.src.startsWith('http') ? (
                <img src={sticker.src} alt="" className="size-full object-contain drop-shadow-md" draggable={false} />
              ) : (
                <span className="text-[32px]">{sticker.src}</span>
              )}

              {stickersDraggable && selectedStickerIndex === index && (
                <>
                  <div className="pointer-events-none absolute -inset-2 border border-dashed border-sky-500">
                    {[
                      'left-[-5px] top-[-5px]',
                      'right-[-5px] top-[-5px]',
                      'bottom-[-5px] left-[-5px]',
                      'bottom-[-5px] right-[-5px]',
                    ].map((position, handleIndex) => (
                      <span
                        key={position}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          event.currentTarget.setPointerCapture(event.pointerId);
                          const stickerRect = event.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                          if (!stickerRect) return;
                          const centerX = stickerRect.left + stickerRect.width / 2;
                          const centerY = stickerRect.top + stickerRect.height / 2;
                          event.currentTarget.dataset.startDistance = String(
                            Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY))
                          );
                          event.currentTarget.dataset.startScale = String(sticker.scale);
                          event.currentTarget.dataset.handleIndex = String(handleIndex);
                        }}
                        onPointerMove={(event) => {
                          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                          const stickerRect = event.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                          if (!stickerRect) return;
                          const centerX = stickerRect.left + stickerRect.width / 2;
                          const centerY = stickerRect.top + stickerRect.height / 2;
                          const distance = Math.max(1, Math.hypot(event.clientX - centerX, event.clientY - centerY));
                          const startDistance = Number(event.currentTarget.dataset.startDistance || distance);
                          const startScale = Number(event.currentTarget.dataset.startScale || sticker.scale);
                          onStickerScale?.(
                            index,
                            Math.max(0.6, Math.min(2.4, startScale * (distance / startDistance)))
                          );
                        }}
                        onPointerUp={(event) => {
                          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                            event.currentTarget.releasePointerCapture(event.pointerId);
                          }
                        }}
                        className={`pointer-events-auto absolute size-2.5 rounded-sm border border-sky-600 bg-white ${position}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedStickerIndex(null);
                      onStickerDelete?.(index);
                    }}
                    className="pointer-events-auto absolute left-1/2 top-[calc(100%+10px)] grid size-8 -translate-x-1/2 place-items-center rounded-full bg-white text-rose-500 shadow-md ring-1 ring-slate-200"
                    title="Hapus sticker"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
          <div>
            {/* HEADER LAYOUT: CLASSIC / BANNER / HERO */}
            {data.headerLayout === 'banner' && (
              <div
                className="w-full h-28 relative overflow-hidden"
                style={{ backgroundColor: data.bannerColor }}
              >
                {data.bannerUrl &&
                  (data.bannerUrl.startsWith('data:video/') ? (
                    <video
                      src={data.bannerUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={data.bannerUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ))}
              </div>
            )}

            {data.headerLayout === 'hero' ? (
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={data.avatarUrl}
                  alt={data.displayName}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-x-0 bottom-0 px-5 py-4 text-center"
                  style={{
                    background: `linear-gradient(to top, ${data.wallpaperColor} 0%, ${data.wallpaperColor}F2 35%, ${data.wallpaperColor}00 100%)`,
                  }}
                >
                  <h3 style={{ color: resolvedTitleColor }} className="font-bold text-base tracking-tight truncate">
                    {data.displayName || 'Your Name'}
                  </h3>
                  {data.bio && (
                    <p style={{ color: subTextColor }} className="text-[11px] line-clamp-2 mt-0.5">
                      {data.bio}
                    </p>
                  )}
                </div>
              </div>
            ) : data.headerLayout === 'shape' ? (
              <div className="px-6 pt-12 text-center">
                <div
                  className="w-24 h-24 mx-auto overflow-hidden border-[3px] border-white shadow-sm"
                  style={getProfileShapeStyle(data.profileShape)}
                >
                  <img
                    src={data.avatarUrl}
                    alt={data.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3
                  style={{ color: resolvedTitleColor }}
                  className="mt-3.5 font-bold text-base tracking-tight"
                >
                  {data.displayName || 'Your Name'}
                </h3>
                {data.bio && (
                  <p style={{ color: subTextColor }} className="mt-1.5 text-xs leading-relaxed max-w-[260px] mx-auto">
                    {data.bio}
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`px-6 text-center ${data.headerLayout === 'banner' ? '-mt-11 relative z-10' : 'pt-12'
                  }`}
              >
                <div
                  className="w-20 h-20 mx-auto overflow-hidden border-[3px] border-white shadow-sm bg-sky-100"
                  style={getProfileShapeStyle(data.profileShape)}
                >
                  <img
                    src={data.avatarUrl}
                    alt={data.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3
                  style={{ color: resolvedTitleColor }}
                  className="mt-3.5 font-bold text-base tracking-tight"
                >
                  {data.displayName || 'Your Name'}
                </h3>

                {data.bio && (
                  <p
                    style={{ color: subTextColor }}
                    className="mt-1.5 text-xs leading-relaxed max-w-[260px] mx-auto"
                  >
                    {data.bio}
                  </p>
                )}
              </div>
            )}

            {/* SOCIAL ICONS ROW */}
            <div
              style={{ color: autoTextColor }}
              className="flex items-center justify-center gap-3.5 mt-4 px-5"
            >
              {data.socials.instagram && (
                <a
                  href={data.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {data.socials.tiktok && (
                <a
                  href={data.socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  <Music2 className="w-4 h-4" />
                </a>
              )}
              {data.socials.whatsapp && (
                <a
                  href={
                    data.socials.whatsapp.startsWith('http')
                      ? data.socials.whatsapp
                      : `https://wa.me/${data.socials.whatsapp.replace(/[^0-9]/g, '')}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {data.socials.youtube && (
                <a
                  href={data.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {data.socials.website && (
                <a
                  href={data.socials.website}
                  target="_blank"
                  rel="noreferrer"
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {data.socials.email && (
                <a
                  href={
                    data.socials.email.startsWith('mailto:')
                      ? data.socials.email
                      : `mailto:${data.socials.email}`
                  }
                  className="opacity-85 hover:opacity-100 transition-opacity"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* LINKS STACK */}
            <div className="px-5 mt-5 space-y-3">
              {skeletonMode ? (
                <>
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      style={{
                        backgroundColor: data.buttonColor,
                        opacity: 0.85,
                      }}
                      className="w-full h-11 rounded-full flex items-center justify-end px-4"
                    >
                      <MoreVertical
                        style={{ color: data.buttonTextColor }}
                        className="w-3.5 h-3.5 opacity-60"
                      />
                    </div>
                  ))}
                </>
              ) : (
                activeLinks.map((link) => {
                  const buttonStyles: React.CSSProperties =
                    data.buttonVariant === 'solid'
                      ? {
                        backgroundColor: data.buttonColor,
                        color: data.buttonTextColor,
                        borderColor: data.buttonColor,
                      }
                      : data.buttonVariant === 'outline'
                        ? {
                          backgroundColor: 'transparent',
                          color: autoTextColor,
                          borderColor: autoTextColor,
                        }
                        : {
                          backgroundColor: lightBg ? '#F1F5F9' : 'rgba(255,255,255,0.14)',
                          color: autoTextColor,
                          borderColor: 'transparent',
                        };

                  if (link.type === 'group') {
                    const groupLinks = data.links.filter(
                      (child) =>
                        child.groupId === link.id &&
                        child.type !== 'group' &&
                        child.active,
                    );
                    const isExpanded = Boolean(expandedGroupIds[link.id]);

                    return (
                      <div
                        key={link.id}
                        style={buttonStyles}
                        className={`group relative w-full overflow-hidden border transition-[border-radius,transform] duration-300 ease-out hover:scale-[1.015] active:scale-[0.99] ${
                          isExpanded ? 'rounded-2xl' : 'rounded-[24px]'
                        }`}
                      >
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() =>
                            setExpandedGroupIds((prev) => ({
                              ...prev,
                              [link.id]: !prev[link.id],
                            }))
                          }
                          className="flex min-h-[48px] w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15">
                            <FolderGit2 className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-center text-xs font-medium">
                            {link.title}
                          </span>
                          <span className="shrink-0 text-[10px] opacity-70">
                            {groupLinks.length} tautan
                          </span>
                          <ChevronDown
                            className={`size-4 shrink-0 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="space-y-2 border-t border-black/10 p-2.5">
                            {groupLinks.map((child) => (
                              <a
                                key={child.id}
                                href={child.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => onLinkClick?.(child.id)}
                                className="flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-black/5 px-3 py-2 text-xs font-medium transition-colors hover:bg-black/10"
                              >
                                <Link2 className="size-3.5 shrink-0 opacity-70" />
                                <span className="min-w-0 flex-1 truncate text-center">
                                  {child.title}
                                </span>
                                <ExternalLink className="size-3 shrink-0 opacity-60" />
                              </a>
                            ))}
                            {groupLinks.length === 0 && (
                              <p className="px-2 py-3 text-center text-xs opacity-70">
                                Belum ada tautan aktif di kelompok ini.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const hasPreview = Boolean(getLinkPreviewUrl(link));
                  const isPreviewOpen = Boolean(expandedPreviewIds[link.id]);

                  return (
                    <div
                      key={link.id}
                      style={buttonStyles}
                      className={`group relative w-full border overflow-hidden transition-[border-radius,transform] duration-300 ease-out hover:scale-[1.015] active:scale-[0.99] ${hasPreview && isPreviewOpen ? 'rounded-2xl' : 'rounded-[24px]'
                        }`}
                    >
                      <div className="min-h-[48px] px-3.5 py-2.5 flex items-center">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => onLinkClick?.(link.id)}
                          className="min-w-0 flex-1 flex items-center gap-2.5"
                        >
                          {renderLinkIcon(link) ? (
                            <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                              {renderLinkIcon(link, 'w-4 h-4')}
                            </span>
                          ) : getLinkIconUrl(link) ? (
                            <img
                              src={getLinkIconUrl(link)!}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover bg-white/80 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                              <Link2 className="w-4 h-4" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 text-center px-1 leading-snug line-clamp-2 text-xs font-medium">
                            {link.title}
                          </span>
                        </a>

                        {hasPreview && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleLinkPreview(link.id);
                            }}
                            className="w-8 h-8 ml-1 shrink-0 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                            title={isPreviewOpen ? 'Sembunyikan preview' : 'Lihat preview web'}
                            aria-label={
                              isPreviewOpen
                                ? `Sembunyikan preview ${link.title}`
                                : `Lihat preview ${link.title}`
                            }
                          >
                            <span
                              className={`transition-transform duration-300 ${isPreviewOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                                }`}
                            >
                              {isPreviewOpen ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onShareLink?.(link);
                          }}
                          className="w-8 h-8 ml-0.5 shrink-0 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
                          title="Share link"
                          aria-label={`Bagikan ${link.title}`}
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {hasPreview && (
                        <div
                          aria-hidden={!isPreviewOpen}
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isPreviewOpen
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                            }`}
                        >
                          <div className="overflow-hidden">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              tabIndex={isPreviewOpen ? 0 : -1}
                              onClick={() => onLinkClick?.(link.id)}
                              className={`block border-t border-black/10 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isPreviewOpen ? 'translate-y-0' : '-translate-y-2'
                                }`}
                            >
                              <LinkPreviewImage link={link} className="w-full h-32 object-cover" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {!skeletonMode && activeLinks.length === 0 && (
                <div
                  style={{ color: subTextColor, borderColor: subTextColor }}
                  className="border border-dashed rounded-2xl p-5 text-center text-xs opacity-60"
                >
                  Belum ada link aktif
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM BioLink-STYLE PILL CTA */}
          <div className="mt-8 px-5 text-center space-y-2.5">
            {data.showFooterBadge && (
              <div className="inline-flex items-center gap-1.5 bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-full text-[11px] font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Join {data.username || 'john-doe'} on BioLink</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

// --- MAIN APPLICATION ---

export default function BioLinkApp() {
  const [data, setData] = useState<BioPageState>(INITIAL_STATE);
  const [step, setStep] = useState<AppStep>('login');
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);

  // Supabase Auth States
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Login / Register inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginUsername, setLoginUsername] = useState('');

  // Step 1 Onboarding Link Inputs
  const [quickTitle, setQuickTitle] = useState('');
  const [quickUrl, setQuickUrl] = useState('');

  // Step 2 Profile Onboarding Sub-tab
  const [profileOnboardingTab, setProfileOnboardingTab] = useState<'profile' | 'header'>('profile');

  // Step 3 Color Onboarding Sub-tab
  const [colorOnboardingTab, setColorOnboardingTab] = useState<'wallpaper' | 'buttons'>('wallpaper');


  // Dashboard States
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('content');
  const [dashboardView, setDashboardView] = useState<'overview' | 'editor'>('overview');
  const [dashboardSection, setDashboardSection] = useState<DashboardSection>('overview');
  const [designPanel, setDesignPanel] = useState<DesignPanel>('menu');
  const [linkChartType, setLinkChartType] = useState<'horizontal' | 'vertical' | 'donut'>('horizontal');
  const [draftMessage, setDraftMessage] = useState('');
  const [audienceEmail, setAudienceEmail] = useState('');
  const [audienceList, setAudienceList] = useState<AudienceContact[]>([]);
  const [audienceQuery, setAudienceQuery] = useState('');
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [audienceLoadedFor, setAudienceLoadedFor] = useState('');
  const [audienceFeedback, setAudienceFeedback] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscriberConsent, setSubscriberConsent] = useState(false);
  const [subscriberSubmitting, setSubscriberSubmitting] = useState(false);
  const [subscriberFeedback, setSubscriberFeedback] = useState('');
  const [plannedPost, setPlannedPost] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState(
    'Terima kasih sudah menghubungi saya. Saya akan segera membalas pesan Anda.'
  );
  const [businessCardName, setBusinessCardName] = useState(data.displayName);
  const [businessCardColor, setBusinessCardColor] = useState('#B8F34A');
  const [showBusinessCardIntro, setShowBusinessCardIntro] = useState(true);
  const [shareDetailsBack, setShareDetailsBack] = useState(true);
  const [saveContactEnabled, setSaveContactEnabled] = useState(true);
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(data.accountEmail);
  const [showContactFields, setShowContactFields] = useState(false);

  // Drag & Drop Link Reordering States
  const [draggedLinkIndex, setDraggedLinkIndex] = useState<number | null>(null);
  const [dragOverLinkIndex, setDragOverLinkIndex] = useState<number | null>(null);

  useEffect(() => {
    setBusinessCardName(data.displayName);
  }, [data.displayName]);

  useEffect(() => {
    setContactEmail(data.accountEmail);
  }, [data.accountEmail]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('biolink-business-card');
      if (!saved) return;
      const settings = JSON.parse(saved) as {
        color?: string;
        shareDetailsBack?: boolean;
        saveContactEnabled?: boolean;
        phone?: string;
      };
      if (settings.color) setBusinessCardColor(settings.color);
      if (typeof settings.shareDetailsBack === 'boolean') setShareDetailsBack(settings.shareDetailsBack);
      if (typeof settings.saveContactEnabled === 'boolean') setSaveContactEnabled(settings.saveContactEnabled);
      if (settings.phone) setContactPhone(settings.phone);
    } catch {
      // Ignore invalid saved business card settings.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      'biolink-business-card',
      JSON.stringify({
        color: businessCardColor,
        shareDetailsBack,
        saveContactEnabled,
        phone: contactPhone,
      })
    );
  }, [
    businessCardName,
    businessCardColor,
    shareDetailsBack,
    saveContactEnabled,
    contactPhone,
    contactEmail,
  ]);

  const [mobileDashMode, setMobileDashMode] = useState<'editor' | 'preview'>('editor');
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [modalItemType, setModalItemType] = useState<'link' | 'group'>('link');
  const [modalGroupId, setModalGroupId] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalThumbnailUrl, setModalThumbnailUrl] = useState('');
  const [modalIconUrl, setModalIconUrl] = useState('');
  const [activeShareLink, setActiveShareLink] = useState<LinkItem | null>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [accountName, setAccountName] = useState('John Doe');
  const [accountAvatar, setAccountAvatar] = useState(INITIAL_STATE.avatarUrl);
  const [authProvider, setAuthProvider] = useState('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Undo/Redo history for dashboard edits
  const [history, setHistory] = useState<BioPageState[]>([]);
  const [redoStack, setRedoStack] = useState<BioPageState[]>([]);

  const [publicProfile, setPublicProfile] = useState<BioPageState | null>(null);
  const [publicProfileLoading, setPublicProfileLoading] = useState(Boolean(PUBLIC_USERNAME));
  const [publicProfileError, setPublicProfileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const stickerInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const isHydratingRef = useRef<boolean>(false);

  const linkIconInputRef = useRef<HTMLInputElement | null>(null);

  const handleLinkIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Pilih file gambar untuk icon');
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast('Ukuran icon maksimal 1 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setModalIconUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 5000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    setAudienceLoading(false);
    if (!data.username) {
      setAudienceList([]);
      setAudienceLoadedFor('');
      return;
    }

    let active = true;
    setAudienceList([]);
    setAudienceLoadedFor('');
    setAudienceFeedback('');

    if (authProvider === 'email') {
      try {
        const stored = window.localStorage.getItem(`biolink-audience-${data.username}`);
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        const contacts = Array.isArray(parsed)
          ? parsed.flatMap((item, index): AudienceContact[] => {
              if (typeof item === 'string' && item.includes('@')) {
                return [{
                  id: `legacy-${index}-${item}`,
                  email: item.toLowerCase(),
                  created_at: new Date().toISOString(),
                }];
              }
              if (
                item &&
                typeof item === 'object' &&
                'id' in item &&
                'email' in item &&
                'created_at' in item &&
                typeof item.id === 'string' &&
                typeof item.email === 'string' &&
                typeof item.created_at === 'string'
              ) {
                return [{
                  id: item.id,
                  email: item.email,
                  created_at: item.created_at,
                }];
              }
              return [];
            })
          : [];
        setAudienceList(contacts);
      } catch {
        setAudienceList([]);
        setAudienceFeedback('Gagal membaca daftar audience lokal.');
      } finally {
        setAudienceLoadedFor(data.username);
      }
      return () => {
        active = false;
      };
    }

    if (!userId || !activeProfileId) {
      setAudienceLoadedFor(data.username);
      return () => {
        active = false;
      };
    }

    setAudienceLoading(true);
    void (async () => {
      try {
        const { data: contacts, error } = await supabase
          .from('bio_audience_contacts')
          .select('id, email, created_at')
          .eq('profile_id', activeProfileId)
          .order('created_at', { ascending: false });
        if (!active) return;
        if (error) {
          setAudienceFeedback(`Gagal memuat audience: ${error.message}`);
          setAudienceList([]);
        } else {
          setAudienceList((contacts || []) as AudienceContact[]);
        }
        setAudienceLoadedFor(data.username);
        setAudienceLoading(false);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
        setAudienceFeedback(`Gagal memuat audience: ${message}`);
        setAudienceList([]);
        setAudienceLoadedFor(data.username);
        setAudienceLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [activeProfileId, authProvider, data.username, userId]);

  useEffect(() => {
    if (
      authProvider !== 'email' ||
      !data.username ||
      audienceLoadedFor !== data.username
    ) {
      return;
    }
    window.localStorage.setItem(
      `biolink-audience-${data.username}`,
      JSON.stringify(audienceList),
    );
  }, [audienceList, audienceLoadedFor, authProvider, data.username]);

  const handleAddAudienceContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = audienceEmail.trim().toLowerCase();
    if (!email) return;
    if (audienceList.some((contact) => contact.email === email)) {
      setAudienceFeedback('Email sudah ada di audience.');
      return;
    }

    if (authProvider === 'email') {
      setAudienceList((contacts) => [
        { id: crypto.randomUUID(), email, created_at: new Date().toISOString() },
        ...contacts,
      ]);
      setAudienceFeedback('Kontak ditambahkan.');
      setAudienceEmail('');
      return;
    }

    if (!userId || !activeProfileId) {
      setAudienceFeedback('Profil belum siap untuk menyimpan kontak.');
      return;
    }

    const { data: contact, error } = await supabase
      .from('bio_audience_contacts')
      .insert({ profile_id: activeProfileId, owner_id: userId, email })
      .select('id, email, created_at')
      .single();

    if (error) {
      setAudienceFeedback(`Gagal menambahkan kontak: ${error.message}`);
      return;
    }

    setAudienceList((contacts) => [contact as AudienceContact, ...contacts]);
    setAudienceFeedback('Kontak ditambahkan.');
    setAudienceEmail('');
  };

  const handleRemoveAudienceContact = async (contact: AudienceContact) => {
    if (authProvider !== 'email') {
      const { error } = await supabase
        .from('bio_audience_contacts')
        .delete()
        .eq('id', contact.id)
        .eq('profile_id', activeProfileId);
      if (error) {
        setAudienceFeedback(`Gagal menghapus kontak: ${error.message}`);
        return;
      }
    }

    setAudienceList((contacts) => contacts.filter((item) => item.id !== contact.id));
    setAudienceFeedback('Kontak dihapus.');
  };

  const handleAudienceSubscription = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subscriberConsent || !PUBLIC_USERNAME) return;

    setSubscriberSubmitting(true);
    setSubscriberFeedback('');
    try {
      const { data: result, error } = await supabase.rpc('subscribe_to_biolink_audience', {
        p_username: PUBLIC_USERNAME,
        p_email: subscriberEmail.trim().toLowerCase(),
      });

      if (error) {
        setSubscriberFeedback(`Pendaftaran gagal: ${error.message}`);
      } else if (result === 'subscribed') {
        setSubscriberFeedback('Terima kasih! Email Anda berhasil didaftarkan.');
        setSubscriberEmail('');
        setSubscriberConsent(false);
      } else if (result === 'already_subscribed') {
        setSubscriberFeedback('Email ini sudah terdaftar.');
      } else if (result === 'profile_not_found') {
        setSubscriberFeedback('Halaman ini tidak ditemukan.');
      } else {
        setSubscriberFeedback('Masukkan alamat email yang valid.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
      setSubscriberFeedback(`Pendaftaran gagal: ${message}`);
    } finally {
      setSubscriberSubmitting(false);
    }
  };

  useEffect(() => {
    if (!PUBLIC_USERNAME) return;

    let mounted = true;

    supabase
      .rpc('get_public_profile', { p_username: PUBLIC_USERNAME })
      .maybeSingle()
      .then(({ data: profile, error }) => {
        if (!mounted) return;

        if (error) {
          setPublicProfileError(error.message);
          setPublicProfileLoading(false);
          return;
        }

        if (!profile) {
          setPublicProfileError('Halaman bio tidak ditemukan.');
          setPublicProfileLoading(false);
          return;
        }

        const publicProfileRow = profile as {
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          banner_color: string | null;
          banner_url: string | null;
          header_layout: string | null;
          profile_shape: string | null;
          title_color: string | null;
          wallpaper_color: string | null;
          button_color: string | null;
          button_text_color: string | null;
          button_variant: string | null;
          font_family: string | null;
          show_footer_badge: boolean | null;
          seo_title: string | null;
          seo_description: string | null;
          no_index: boolean | null;
          socials: SocialChannels | null;
          links: LinkItem[] | null;
          stickers: unknown[] | null;
        };

        setPublicProfile({
          accountEmail: '',
          username: sanitizeLegacyProfileValue(publicProfileRow.username, 'username'),
          displayName: sanitizeLegacyProfileValue(
            publicProfileRow.display_name || publicProfileRow.username,
            'displayName',
          ),
          bio: sanitizeLegacyProfileValue(publicProfileRow.bio || '', 'bio'),
          avatarUrl: publicProfileRow.avatar_url || INITIAL_STATE.avatarUrl,
          bannerColor: publicProfileRow.banner_color || '#0EA5E9',
          bannerUrl: publicProfileRow.banner_url || '',
          headerLayout: (publicProfileRow.header_layout as HeaderLayoutType) || 'classic',
          profileShape: (publicProfileRow.profile_shape as ProfileShape) || 'circle',
          titleColor: publicProfileRow.title_color || '#0F172A',
          wallpaperColor: publicProfileRow.wallpaper_color || '#FFFFFF',
          buttonColor: publicProfileRow.button_color || '#0EA5E9',
          buttonTextColor: publicProfileRow.button_text_color || '#FFFFFF',
          buttonVariant: (publicProfileRow.button_variant as ButtonVariant) || 'solid',
          fontFamily: (publicProfileRow.font_family as FontChoice) || 'DM Sans',
          showFooterBadge: publicProfileRow.show_footer_badge ?? true,
          seoTitle: publicProfileRow.seo_title || '',
          seoDescription: publicProfileRow.seo_description || '',
          noIndex: publicProfileRow.no_index ?? false,
          socials: { ...INITIAL_STATE.socials, ...(publicProfileRow.socials || {}) },
          links: Array.isArray(publicProfileRow.links) ? publicProfileRow.links : [],
          stickers: normalizeStickers(publicProfileRow.stickers),
        });
        setPublicProfileLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!PUBLIC_USERNAME || !publicProfile) return;

    document.title =
      publicProfile.seoTitle || `${publicProfile.displayName || publicProfile.username} - BioLink`;

    let descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.name = 'description';
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.content =
      publicProfile.seoDescription ||
      publicProfile.bio ||
      `${publicProfile.displayName || publicProfile.username} - BioLink`;

    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = publicProfile.noIndex ? 'noindex, nofollow' : 'index, follow';
  }, [publicProfile]);

  const loadUserProfile = async (
    uid: string,
    email: string,
    fallbackUsername?: string,
    isNewAccount = false,
    accountDisplayName?: string,
    accountImageUrl?: string,
  ) => {
    isHydratingRef.current = true;
    try {
      const { data: ownedProfiles, error: profilesError } = await supabase
        .from('bio_profiles')
        .select('id, username, display_name, avatar_url')
        .eq('owner_id', uid)
        .order('username', { ascending: true });

      if (profilesError) {
        console.error('Gagal memuat daftar profil:', profilesError.message);
        setAuthError(`Gagal memuat profil: ${profilesError.message}`);
        return;
      }

      const profileRows = (ownedProfiles || []) as ProfileSummary[];
      setProfiles(profileRows);

      const savedProfileId = window.localStorage.getItem('biolink-active-profile-id');
      const preferredProfileId =
        profileRows.find((profile) => profile.id === savedProfileId)?.id ||
        profileRows[0]?.id ||
        null;

      const profile = preferredProfileId
        ? await supabase
            .from('bio_profiles')
            .select('*')
            .eq('id', preferredProfileId)
            .maybeSingle()
            .then(({ data: selectedProfile }) => selectedProfile)
        : null;

      if (profile) {
        setActiveProfileId(profile.id);
        window.localStorage.setItem('biolink-active-profile-id', profile.id);
        const resolvedAccountName = accountDisplayName?.trim() || getNameFromEmail(email);
        setAccountName(sanitizeLegacyProfileValue(resolvedAccountName, 'displayName'));
        setAccountAvatar(accountImageUrl || profile.avatar_url || INITIAL_STATE.avatarUrl);
        const loadedDisplayName = sanitizeLegacyProfileValue(
          profile.display_name || profile.username,
          'displayName',
        );
        const shouldUseAccountName =
          profile.display_name === profile.username ||
          ['Untitled Linktree', 'User Baru', 'John Doe'].includes(
            profile.display_name || '',
          );
        setData({
          accountEmail: email,
          username: sanitizeLegacyProfileValue(profile.username, 'username'),
          displayName: shouldUseAccountName ? resolvedAccountName : loadedDisplayName,
          bio: sanitizeLegacyProfileValue(profile.bio || '', 'bio'),
          avatarUrl: profile.avatar_url || INITIAL_STATE.avatarUrl,
          bannerColor: profile.banner_color || '#0EA5E9',
          bannerUrl: profile.banner_url || '',
          headerLayout: (profile.header_layout as HeaderLayoutType) || 'classic',
          profileShape: (profile.profile_shape as ProfileShape) || 'circle',
          titleColor: profile.title_color || '#0F172A',
          wallpaperColor: profile.wallpaper_color || '#FFFFFF',
          buttonColor: profile.button_color || '#0EA5E9',
          buttonTextColor: profile.button_text_color || '#FFFFFF',
          buttonVariant: (profile.button_variant as ButtonVariant) || 'solid',
          fontFamily: (profile.font_family as FontChoice) || 'DM Sans',
          showFooterBadge: profile.show_footer_badge ?? true,
          seoTitle: profile.seo_title || '',
          seoDescription: profile.seo_description || '',
          noIndex: profile.no_index ?? false,
          socials: { ...INITIAL_STATE.socials, ...(profile.socials || {}) },
          links: Array.isArray(profile.links) ? profile.links : [],
          stickers: normalizeStickers(profile.stickers),
        });
        setStep(isNewAccount ? 'step-links' : 'dashboard');
      } else {
        const cleanUsername = (fallbackUsername || email.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9._]/g, '');
        const newProfile: BioPageState = {
          ...INITIAL_STATE,
          accountEmail: email,
          username: cleanUsername || `user${Date.now().toString().slice(-4)}`,
          displayName: accountDisplayName?.trim() || getNameFromEmail(email),
          links: [],
        };

        const { error: insertError } = await supabase.from('bio_profiles').insert({
          id: uid,
          owner_id: uid,
          username: newProfile.username,
          display_name: newProfile.displayName,
          bio: newProfile.bio,
          avatar_url: newProfile.avatarUrl,
          banner_color: newProfile.bannerColor,
          banner_url: newProfile.bannerUrl,
          header_layout: newProfile.headerLayout,
          profile_shape: newProfile.profileShape,
          title_color: newProfile.titleColor,
          wallpaper_color: newProfile.wallpaperColor,
          button_color: newProfile.buttonColor,
          button_text_color: newProfile.buttonTextColor,
          button_variant: newProfile.buttonVariant,
          font_family: newProfile.fontFamily,
          show_footer_badge: newProfile.showFooterBadge,
          seo_title: newProfile.seoTitle,
          seo_description: newProfile.seoDescription,
          no_index: newProfile.noIndex,
          socials: newProfile.socials,
          links: newProfile.links,
          stickers: newProfile.stickers,
        });

        if (insertError) {
          console.error('Gagal membuat profil awal:', insertError.message);
          setAuthError(`Gagal membuat profil: ${insertError.message}`);
          return;
        }

        setAccountName(
          sanitizeLegacyProfileValue(
            accountDisplayName?.trim() || getNameFromEmail(email),
            'displayName',
          ),
        );
        setAccountAvatar(accountImageUrl || INITIAL_STATE.avatarUrl);
        setActiveProfileId(uid);
        window.localStorage.setItem('biolink-active-profile-id', uid);
        setProfiles([{
          id: uid,
          username: newProfile.username,
          display_name: newProfile.displayName,
          avatar_url: newProfile.avatarUrl,
        }]);
        setData(newProfile);
        setStep('step-links');
      }
    } finally {
      setTimeout(() => {
        isHydratingRef.current = false;
      }, 150);
    }
  };

  const switchProfile = async (profileId: string, openEditor = false) => {
    if (!userId || profileId === activeProfileId) return;

    isHydratingRef.current = true;
    const { data: profile, error } = await supabase
      .from('bio_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      showToast(`Gagal membuka halaman: ${error.message}`);
      isHydratingRef.current = false;
      return;
    }

    if (!profile) {
      showToast('Halaman tidak ditemukan');
      isHydratingRef.current = false;
      return;
    }

    setActiveProfileId(profileId);
    window.localStorage.setItem('biolink-active-profile-id', profileId);
    window.localStorage.setItem('biolink-active-profile-id', profileId);
    setData({
      accountEmail: data.accountEmail,
      username: sanitizeLegacyProfileValue(profile.username, 'username'),
      displayName: sanitizeLegacyProfileValue(
        profile.display_name || profile.username,
        'displayName',
      ),
      bio: sanitizeLegacyProfileValue(profile.bio || '', 'bio'),
      avatarUrl: profile.avatar_url || INITIAL_STATE.avatarUrl,
      bannerColor: profile.banner_color || '#0EA5E9',
      bannerUrl: profile.banner_url || '',
      headerLayout: (profile.header_layout as HeaderLayoutType) || 'classic',
      profileShape: (profile.profile_shape as ProfileShape) || 'circle',
      titleColor: profile.title_color || '#0F172A',
      wallpaperColor: profile.wallpaper_color || '#FFFFFF',
      buttonColor: profile.button_color || '#0EA5E9',
      buttonTextColor: profile.button_text_color || '#FFFFFF',
      buttonVariant: (profile.button_variant as ButtonVariant) || 'solid',
      fontFamily: (profile.font_family as FontChoice) || 'DM Sans',
      showFooterBadge: profile.show_footer_badge ?? true,
      seoTitle: profile.seo_title || '',
      seoDescription: profile.seo_description || '',
      noIndex: profile.no_index ?? false,
      socials: { ...INITIAL_STATE.socials, ...(profile.socials || {}) },
      links: Array.isArray(profile.links) ? profile.links : [],
      stickers: normalizeStickers(profile.stickers),
    });
    setDashboardView(openEditor ? 'editor' : 'overview');
    setDashboardSection('overview');
    setShowProfileMenu(false);
    setStep('dashboard');
    setTimeout(() => {
      isHydratingRef.current = false;
    }, 150);
  };

  const refreshProfiles = async () => {
    if (!userId) return;

    const { data: ownedProfiles, error } = await supabase
      .from('bio_profiles')
      .select('id, username, display_name, avatar_url')
      .eq('owner_id', userId)
      .order('username', { ascending: true });

    if (error) {
      console.error('Gagal memperbarui daftar BioLink:', error.message);
      showToast(`Gagal memperbarui daftar BioLink: ${error.message}`);
      return;
    }

    setProfiles((ownedProfiles || []) as ProfileSummary[]);
  };

  const createProfile = async () => {
    if (!userId) {
      showToast('Anda harus masuk terlebih dahulu');
      return;
    }

    const profileId = crypto.randomUUID();
    const suffix = Date.now().toString().slice(-6);
    const username = `BioLink-${suffix}`;
    const newProfile: BioPageState = {
      ...INITIAL_STATE,
      accountEmail: data.accountEmail,
      username,
      displayName: '',
      bio: '',
      links: [],
    };

    const { error } = await supabase.from('bio_profiles').insert({
      id: profileId,
      owner_id: userId,
      username: newProfile.username,
      display_name: newProfile.displayName,
      bio: newProfile.bio,
      avatar_url: newProfile.avatarUrl,
      banner_color: newProfile.bannerColor,
      banner_url: newProfile.bannerUrl,
      header_layout: newProfile.headerLayout,
      profile_shape: newProfile.profileShape,
      title_color: newProfile.titleColor,
      wallpaper_color: newProfile.wallpaperColor,
      button_color: newProfile.buttonColor,
      button_text_color: newProfile.buttonTextColor,
      button_variant: newProfile.buttonVariant,
      font_family: newProfile.fontFamily,
      show_footer_badge: newProfile.showFooterBadge,
      seo_title: newProfile.seoTitle,
      seo_description: newProfile.seoDescription,
      no_index: newProfile.noIndex,
      socials: newProfile.socials,
      links: newProfile.links,
      stickers: newProfile.stickers,
    });

    if (error) {
      showToast(`Gagal membuat BioLink: ${error.message}`);
      return;
    }

    setProfiles((prev) => [
      ...prev,
      {
        id: profileId,
        username,
        display_name: newProfile.displayName,
        avatar_url: newProfile.avatarUrl,
      },
    ]);
    void refreshProfiles();
    setActiveProfileId(profileId);
    setData(newProfile);
    setShowProfileMenu(false);
    setDashboardView('editor');
    setDashboardSection('overview');
    setStep('dashboard');
  };

  const deleteProfile = async (profileId: string) => {
    if (!userId) {
      showToast('Anda harus masuk terlebih dahulu');
      return;
    }

    if (profiles.length <= 1) {
      showToast('Minimal satu BioLink harus tetap tersedia');
      return;
    }

    const profileToDelete = profiles.find((profile) => profile.id === profileId);
    const profileName =
      profileToDelete?.display_name?.trim() ||
      profileToDelete?.username ||
      'BioLink ini';

    if (!window.confirm(`Hapus "${profileName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    const { error } = await supabase
      .from('bio_profiles')
      .delete()
      .eq('id', profileId)
      .eq('owner_id', userId);

    if (error) {
      showToast(`Gagal menghapus BioLink: ${error.message}`);
      return;
    }

    const remainingProfiles = profiles.filter((profile) => profile.id !== profileId);
    setProfiles(remainingProfiles);

    if (profileId === activeProfileId && remainingProfiles[0]) {
      setActiveProfileId(null);
      await switchProfile(remainingProfiles[0].id);
    } else if (profileId === activeProfileId) {
      window.localStorage.removeItem('biolink-active-profile-id');
    }

    showToast('BioLink berhasil dihapus');
  };

  // Restore authenticated Supabase sessions.
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        window.localStorage.removeItem(LOCAL_SESSION_KEY);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          setAuthError(`Gagal memeriksa sesi: ${error.message}`);
          return;
        }

        if (session?.user) {
          setUserId(session.user.id);
          setAuthProvider(session.user.app_metadata?.provider || 'email');
          const metadata = session.user.user_metadata || {};
          await loadUserProfile(
            session.user.id,
            session.user.email || '',
            typeof metadata.username === 'string' ? metadata.username : undefined,
            false,
            metadata.full_name || metadata.name || metadata.display_name,
            metadata.avatar_url || metadata.picture,
          );
        }
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
        setAuthError(`Gagal memeriksa sesi: ${message}`);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setUserId(null);
        setAuthProvider('email');
        setData(INITIAL_STATE);
        setAccountName('John Doe');
        setAccountAvatar(INITIAL_STATE.avatarUrl);
        setActiveProfileId(null);
        setProfiles([]);
        window.localStorage.removeItem('biolink-active-profile-id');
        setStep('login');
      }
    });

    void restoreSession();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const saveProfileToCloud = useCallback(async (profileData: BioPageState = data) => {
    if (!userId || !activeProfileId) {
      setSyncStatus('error');
      setSyncError('Tidak ada profil aktif untuk disimpan.');
      return false;
    }

    setSyncStatus('saving');
    setSyncError(null);
    try {
      const { data: savedProfile, error } = await supabase
        .from('bio_profiles')
        .update({
          username: profileData.username,
          display_name: profileData.displayName,
          bio: profileData.bio,
          avatar_url: profileData.avatarUrl,
          banner_color: profileData.bannerColor,
          banner_url: profileData.bannerUrl,
          header_layout: profileData.headerLayout,
          profile_shape: profileData.profileShape,
          title_color: profileData.titleColor,
          wallpaper_color: profileData.wallpaperColor,
          button_color: profileData.buttonColor,
          button_text_color: profileData.buttonTextColor,
          button_variant: profileData.buttonVariant,
          font_family: profileData.fontFamily,
          show_footer_badge: profileData.showFooterBadge,
          seo_title: profileData.seoTitle,
          seo_description: profileData.seoDescription,
          no_index: profileData.noIndex,
          socials: profileData.socials,
          links: profileData.links,
          stickers: profileData.stickers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeProfileId)
        .eq('owner_id', userId)
        .select('id')
        .maybeSingle();

      if (error) throw error;
      if (!savedProfile) {
        throw new Error('Profil tidak ditemukan atau Anda tidak memiliki akses.');
      }

      setSyncStatus('saved');
      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === activeProfileId
            ? {
                ...profile,
                username: profileData.username,
                display_name: profileData.displayName,
                avatar_url: profileData.avatarUrl,
              }
            : profile,
        ),
      );
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
      console.error('Gagal sync ke Supabase:', error);
      setSyncStatus('error');
      setSyncError(message);
      showToast(`Gagal menyimpan: ${message}`);
      return false;
    }
  }, [activeProfileId, data, showToast, userId]);

  const handleManualProfileSave = async () => {
    if (await saveProfileToCloud()) {
      showToast('Perubahan berhasil disimpan');
    }
  };

  // Auto-sync perubahan data ke Supabase (debounce 600ms)
  useEffect(() => {
    if (!userId || !activeProfileId || step === 'login' || isHydratingRef.current) return;

    setSyncStatus('saving');
    setSyncError(null);
    const timeout = setTimeout(() => {
      void saveProfileToCloud();
    }, 600);
    return () => clearTimeout(timeout);
  }, [saveProfileToCloud, step, userId, activeProfileId]);

  // Automatic transition timer for Step 5 ("Looking good. Let's keep building...")
  useEffect(() => {
    if (step === 'transition') {
      const timer = setTimeout(() => {
        setStep('dashboard');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const updateDataWithHistory = (updater: (prev: BioPageState) => BioPageState) => {
    setData((prev) => {
      setHistory((h) => [...h.slice(-15), prev]);
      setRedoStack([]);
      return updater(prev);
    });
  };

  const handleReorderLinks = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    updateDataWithHistory((prev) => {
      const updated = [...prev.links];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, links: updated };
    });
    showToast('Urutan link diperbarui');
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((r) => [data, ...r]);
    setHistory((h) => h.slice(0, -1));
    setData(previous);
    showToast('Perubahan dibatalkan');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((h) => [...h, data]);
    setRedoStack((r) => r.slice(1));
    setData(next);
    showToast('Perubahan dikembalikan');
  };

  const handleCopyShareUrl = () => {
    const shareLink = getPublicProfileUrl(data.username || 'john-doe');
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    showToast(`Link disalin: ${shareLink}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBusinessCardQr = () => {
    const svg = document.querySelector<SVGSVGElement>('#business-card-qr svg');
    if (!svg) {
      showToast('QR code belum siap');
      return;
    }

    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const padding = 80;
      canvas.width = 1024;
      canvas.height = 1024;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, padding, padding, canvas.width - padding * 2, canvas.height - padding * 2);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const anchor = document.createElement('a');
        anchor.href = pngUrl;
        anchor.download = `${data.username || 'BioLink'}-business-card-qr.png`;
        anchor.click();
        URL.revokeObjectURL(pngUrl);
        showToast('QR code berhasil diunduh');
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      showToast('QR code gagal diunduh');
    };
    image.src = svgUrl;
  };

  const handleDownloadVCard = () => {
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${businessCardName || data.displayName}`,
      `ORG:${data.displayName}`,
      contactPhone ? `TEL;TYPE=CELL:${contactPhone}` : '',
      contactEmail ? `EMAIL:${contactEmail}` : '',
      `URL:${getPublicProfileUrl(data.username)}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const url = URL.createObjectURL(new Blob([vCard], { type: 'text/vcard;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${data.username || 'contact'}.vcf`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Contact card berhasil diunduh');
  };

  const handleShareBusinessCard = async () => {
    const url = getPublicProfileUrl(data.username);
    const title = businessCardName || data.displayName;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Kartu digital ${title}`,
          url,
        });
        showToast('Business card berhasil dibagikan');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    await handleCopyShareUrl();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDataWithHistory((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
        showToast('Foto profil diperbarui');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Pilih file gambar untuk sticker');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Ukuran sticker maksimal 3 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      updateDataWithHistory((prev) => ({
        ...prev,
        stickers: [
          ...prev.stickers,
          {
            src: reader.result as string,
            x: 82,
            y: 54,
            scale: 1,
          },
        ].slice(-8),
      }));
      showToast('Sticker ditambahkan');
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      showToast('Pilih file gambar atau video');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDataWithHistory((prev) => ({
          ...prev,
          bannerUrl: reader.result as string,
          headerLayout: 'banner',
        }));
        showToast(
          file.type.startsWith('video/') ? 'Video banner diperbarui' : 'Gambar banner diperbarui'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // --- STEP 0: LOGIN & REGISTER LOKAL ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);
    setAuthSubmitting(true);

    try {
      if (authMode === 'register') {
        const cleanUser = loginUsername.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
        const cleanEmail = loginEmail.trim().toLowerCase();
        if (!cleanUser) {
          setAuthError('Username wajib diisi (huruf kecil, angka, titik, atau underscore).');
          return;
        }
        if (!cleanEmail || loginPassword.length < 6) {
          setAuthError('Email dan kata sandi minimal 6 karakter wajib diisi.');
          return;
        }

        const { data: usernameAvailable, error: availabilityError } = await supabase.rpc(
          'check_username_available',
          { p_username: cleanUser },
        );
        if (availabilityError) {
          setAuthError(`Gagal memeriksa username: ${availabilityError.message}`);
          return;
        }
        if (!usernameAvailable) {
          setAuthError('Username sudah digunakan.');
          return;
        }

        const displayName = getNameFromEmail(cleanEmail);
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: loginPassword,
          options: {
            emailRedirectTo: APP_URL,
            data: {
              username: cleanUser,
              display_name: displayName,
            },
          },
        });
        if (error) {
          setAuthError(`Gagal membuat akun: ${error.message}`);
          return;
        }

        if (signUpData.session && signUpData.user) {
          setUserId(signUpData.user.id);
          setAuthProvider(signUpData.user.app_metadata?.provider || 'email');
          await loadUserProfile(
            signUpData.user.id,
            cleanEmail,
            cleanUser,
            true,
            displayName,
          );
        } else {
          setAuthNotice(
            'Jika email dapat didaftarkan, tautan verifikasi akan dikirim. Periksa inbox atau spam; jika sudah punya akun, silakan masuk.',
          );
          setAuthMode('login');
        }
      } else {
        const cleanEmail = loginEmail.trim().toLowerCase();
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: loginPassword,
        });
        if (error) {
          setAuthError(`Gagal masuk: ${error.message}`);
          return;
        }

        const user = signInData.user;
        if (!user) {
          setAuthError('Login berhasil tetapi data akun tidak ditemukan. Silakan coba lagi.');
          return;
        }

        setUserId(user.id);
        setAuthProvider(user.app_metadata?.provider || 'email');
        const metadata = user.user_metadata || {};
        await loadUserProfile(
          user.id,
          user.email || cleanEmail,
          typeof metadata.username === 'string' ? metadata.username : undefined,
          false,
          metadata.full_name || metadata.name || metadata.display_name,
          metadata.avatar_url || metadata.picture,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
      setAuthError(`Terjadi kesalahan saat memproses akun: ${message}`);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: APP_URL,
        },
      });

      if (error) {
        setAuthError(`Gagal login dengan Google: ${error.message}`);
        setAuthSubmitting(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
      setAuthError(`Gagal login dengan Google: ${message}`);
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(`Gagal keluar dari akun: ${error.message}`);
      return;
    }
    window.localStorage.removeItem('biolink-active-profile-id');
    setUserId(null);
    setAuthProvider('email');
    setActiveProfileId(null);
    setProfiles([]);
    setData(INITIAL_STATE);
    setHistory([]);
    setRedoStack([]);
    setStep('login');
    showToast('Berhasil keluar dari akun');
  };

  const handleSaveSettings = async () => {
    const username = data.username.trim().toLowerCase();
    if (!username) {
      showToast('Username tidak boleh kosong');
      return;
    }
    if (!/^[a-z0-9-]{1,30}$/.test(username)) {
      showToast('Username hanya boleh berisi huruf kecil, angka, dan tanda hubung (maksimal 30 karakter).');
      return;
    }
    if (!userId || !activeProfileId) {
      showToast('Tidak ada profil aktif untuk diperbarui.');
      return;
    }

    const { data: usernameAvailable, error: availabilityError } = await supabase.rpc(
      'check_username_available',
      {
        p_username: username,
      },
    );

    if (availabilityError) {
      showToast(`Gagal memeriksa username: ${availabilityError.message}`);
      return;
    }

    const { data: ownProfile, error: profileError } = await supabase
      .from('bio_profiles')
      .select('username')
      .eq('id', activeProfileId)
      .eq('owner_id', userId)
      .maybeSingle();

    if (profileError) {
      showToast(`Gagal memeriksa profil: ${profileError.message}`);
      return;
    }
    if (!ownProfile) {
      showToast('Profil tidak ditemukan atau Anda tidak memiliki akses.');
      return;
    }

    if (usernameAvailable === false && ownProfile.username !== username) {
      showToast('Username sudah digunakan');
      return;
    }

    const profileToSave = { ...data, username };
    setData(profileToSave);
    if (await saveProfileToCloud(profileToSave)) {
      showToast('Username berhasil disimpan');
    }
  };

  const handleChangePassword = async () => {
    if (authProvider !== 'email') {
      showToast('Ganti password hanya tersedia untuk akun email');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi password tidak cocok');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showToast(`Gagal mengganti password: ${error.message}`);
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password berhasil diganti');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Hapus profil dan keluar dari akun? Tindakan ini tidak dapat dibatalkan.'
    );
    if (!confirmed || !userId) return;

    const { error } = await supabase.rpc('delete_account');
    if (error) {
      showToast(`Gagal menghapus akun: ${error.message}`);
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    window.localStorage.removeItem('biolink-active-profile-id');
    setUserId(null);
    setAuthProvider('email');
    setActiveProfileId(null);
    setProfiles([]);
    setData(INITIAL_STATE);
    setAccountName('John Doe');
    setAccountAvatar(INITIAL_STATE.avatarUrl);
    setStep('login');
    showToast(
      signOutError
        ? `Akun sudah dihapus, tetapi sesi gagal diakhiri: ${signOutError.message}`
        : 'Akun berhasil dihapus',
    );
  };

  // --- STEP 1: ONBOARDING ADD LINK ---
  const handleOnboardingAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickUrl.trim()) return;
    const formatted =
      quickUrl.startsWith('http://') || quickUrl.startsWith('https://')
        ? quickUrl.trim()
        : `https://${quickUrl.trim()}`;
    const newItem: LinkItem = {
      id: `link-${Date.now()}`,
      title: quickTitle.trim(),
      url: formatted,
      active: true,
      clicks: 0,
    };
    setData((prev) => ({ ...prev, links: [newItem, ...prev.links] }));
    setQuickTitle('');
    setQuickUrl('');
    showToast('Link ditambahkan');
  };

  // --- DASHBOARD ADD / EDIT LINK ---
  const openCreateModal = () => {
    setEditingLink(null);
    setModalItemType('link');
    setModalGroupId('');
    setModalTitle('');
    setModalUrl('');
    setModalThumbnailUrl('');
    setModalIconUrl('');
    setShowAddLinkModal(true);
  };

  const openCreateGroupModal = () => {
    setEditingLink(null);
    setModalItemType('group');
    setModalGroupId('');
    setModalTitle('');
    setModalUrl('');
    setModalThumbnailUrl('');
    setModalIconUrl('');
    setShowAddLinkModal(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setModalItemType(link.type === 'group' ? 'group' : 'link');
    setModalGroupId(link.groupId || '');
    setModalTitle(link.title);
    setModalUrl(link.url);
    setModalThumbnailUrl(link.thumbnailUrl || '');
    setModalIconUrl(link.iconUrl || '');
    setShowAddLinkModal(true);
  };

  const handleSaveModalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    if (modalItemType === 'group') {
      if (editingLink) {
        updateDataWithHistory((prev) => ({
          ...prev,
          links: prev.links.map((link) =>
            link.id === editingLink.id
              ? { ...link, title: modalTitle.trim(), url: '', type: 'group', groupId: undefined }
              : link
          ),
        }));
      } else {
        updateDataWithHistory((prev) => ({
          ...prev,
          links: [
            {
              id: `group-${Date.now()}`,
              title: modalTitle.trim(),
              url: '',
              active: true,
              clicks: 0,
              type: 'group',
            },
            ...prev.links,
          ],
        }));
      }
      setShowAddLinkModal(false);
      return;
    }

    if (!modalUrl.trim()) return;
    const formatted =
      modalUrl.startsWith('http://') || modalUrl.startsWith('https://')
        ? modalUrl.trim()
        : `https://${modalUrl.trim()}`;

    if (editingLink) {
      updateDataWithHistory((prev) => ({
        ...prev,
        links: prev.links.map((l) =>
          l.id === editingLink.id
            ? {
              ...l,
              title: modalTitle.trim(),
              url: formatted,
              type: 'link',
              groupId: modalGroupId || undefined,
              thumbnailUrl: modalThumbnailUrl.trim() || undefined,
              iconUrl: modalIconUrl.trim() || undefined,
            }
            : l
        ),
      }));
      showToast('Link diperbarui');
    } else {
      updateDataWithHistory((prev) => ({
        ...prev,
        links: [
          {
            id: `link-${Date.now()}`,
            title: modalTitle.trim(),
            url: formatted,
            active: true,
            clicks: 0,
            type: 'link',
            groupId: modalGroupId || undefined,
            thumbnailUrl: modalThumbnailUrl.trim() || undefined,
            iconUrl: modalIconUrl.trim() || undefined,
          },
          ...prev.links,
        ],
      }));
      showToast('Link baru ditambahkan');
    }
    setShowAddLinkModal(false);
  };

  const handleDeleteLinkItem = (item: LinkItem) => {
    updateDataWithHistory((prev) => ({
      ...prev,
      links: prev.links
        .filter((link) => link.id !== item.id)
        .map((link) =>
          item.type === 'group' && link.groupId === item.id
            ? { ...link, groupId: undefined }
            : link
        ),
    }));
  };

  const handleIncrementClick = (id: string) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l)),
    }));
  };

  const actualLinks = data.links.filter((link) => link.type !== 'group');
  const linkGroups = data.links.filter((link) => link.type === 'group');

  const audienceGrowthStart = new Date();
  audienceGrowthStart.setHours(0, 0, 0, 0);
  audienceGrowthStart.setDate(audienceGrowthStart.getDate() - 6);
  const audienceGrowthBuckets = Array.from({ length: 7 }, () => 0);
  let audienceGrowthBaseline = 0;
  audienceList.forEach((contact) => {
    const createdAt = new Date(contact.created_at);
    if (Number.isNaN(createdAt.getTime())) return;
    createdAt.setHours(0, 0, 0, 0);
    const dayIndex = Math.floor(
      (createdAt.getTime() - audienceGrowthStart.getTime()) / 86_400_000,
    );
    if (dayIndex < 0) {
      audienceGrowthBaseline += 1;
    } else if (dayIndex < audienceGrowthBuckets.length) {
      audienceGrowthBuckets[dayIndex] += 1;
    }
  });
  let audienceGrowthTotal = audienceGrowthBaseline;
  const audienceGrowthTotals = audienceGrowthBuckets.map((dailyGrowth) => {
    audienceGrowthTotal += dailyGrowth;
    return audienceGrowthTotal;
  });
  const audienceGrowthMax = Math.max(...audienceGrowthTotals, 1);
  const audienceGrowthSeries = audienceGrowthTotals.map((total, index) => {
    const x = 8 + (index * 264) / 6;
    const y = 108 - (total / audienceGrowthMax) * 84;
    const date = new Date(audienceGrowthStart);
    date.setDate(audienceGrowthStart.getDate() + index);
    return {
      x,
      y,
      total,
      label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
    };
  });
  const audienceGrowthPoints = audienceGrowthSeries
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
  const audienceGrowthThisWeek = audienceGrowthBuckets.reduce(
    (total, count) => total + count,
    0,
  );

  // ============================================================================
  // RENDER 0A: PUBLIC BIO PAGE (/username)
  // ============================================================================
  if (PUBLIC_USERNAME) {
    if (publicProfileLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
        </div>
      );
    }

    if (publicProfileError || !publicProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 text-center bg-white">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
            <p className="text-sm text-slate-500 mt-2">
              {publicProfileError || 'Profil belum tersedia.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <main
          style={{ backgroundColor: publicProfile.wallpaperColor }}
          className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8"
        >
          <LivePhoneMockup
            data={publicProfile}
            onLinkClick={(id) => {
              void supabase.rpc('increment_profile_link_click', {
                p_username: PUBLIC_USERNAME,
                p_link_id: id,
              });
            }}
            onShareLink={setActiveShareLink}
          />
          <section className="mt-6 w-full max-w-[390px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Dapatkan update</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Daftar untuk menerima kabar terbaru dari {publicProfile.displayName || publicProfile.username}.
            </p>
            <form onSubmit={handleAudienceSubscription} className="mt-4 space-y-3">
              <input
                type="email"
                required
                maxLength={320}
                value={subscriberEmail}
                onChange={(event) => setSubscriberEmail(event.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
              <label className="flex items-start gap-2 text-[11px] leading-4 text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={subscriberConsent}
                  onChange={(event) => setSubscriberConsent(event.target.checked)}
                  className="mt-0.5 accent-violet-600"
                />
                <span>
                  Saya setuju email ini disimpan dan digunakan oleh pemilik halaman untuk mengirim
                  update.
                </span>
              </label>
              <button
                type="submit"
                disabled={subscriberSubmitting || !subscriberConsent}
                className="w-full rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {subscriberSubmitting ? 'Mendaftarkan...' : 'Daftar update'}
              </button>
            </form>
            {subscriberFeedback && (
              <p role="status" aria-live="polite" className="mt-3 text-xs text-slate-600">
                {subscriberFeedback}
              </p>
            )}
          </section>
        </main>
        {activeShareLink && (
          <div
            onClick={() => setActiveShareLink(null)}
            className="fixed inset-0 z-50 bg-slate-950/55 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="bg-white rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Share link</h3>
                <button
                  type="button"
                  onClick={() => setActiveShareLink(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 text-white p-4 text-center">
                {getLinkPreviewUrl(activeShareLink) ? (
                  <LinkPreviewImage
                    link={activeShareLink}
                    className="w-full h-32 rounded-xl object-cover mb-3"
                    fallbackClassName="h-32 rounded-xl mb-3"
                  />
                ) : getLinkIconUrl(activeShareLink) ? (
                  <img
                    src={getLinkIconUrl(activeShareLink)!}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover mx-auto mb-3 bg-white"
                  />
                ) : null}
                <p className="font-bold text-sm line-clamp-2">{activeShareLink.title}</p>
                <p className="text-[11px] text-slate-300 mt-1 truncate">{activeShareLink.url}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeShareLink.url);
                    showToast('Link disalin');
                  }}
                  className="h-11 rounded-full border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Copy link
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (navigator.share) {
                      await navigator.share({
                        title: activeShareLink.title,
                        url: activeShareLink.url,
                      });
                    } else {
                      navigator.clipboard?.writeText(activeShareLink.url);
                      showToast('Link disalin');
                    }
                  }}
                  className="h-11 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Bagikan
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ============================================================================
  // RENDER 0: SESSION LOADING SCREEN
  // ============================================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center gap-3">
        <BrandMark size="lg" />
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          <span>Memeriksa sesi akun...</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 1: HALAMAN LOGIN & REGISTER AKUN (SUPABASE AUTH + GOOGLE OAUTH)
  // ============================================================================
  if (step === 'login') {
    return (
      <AuthTemplate
        mode={authMode}
        email={loginEmail}
        password={loginPassword}
        username={loginUsername}
        error={authError}
        notice={authNotice}
        submitting={authSubmitting}
        onModeChange={(mode) => {
          setAuthMode(mode);
          setAuthError(null);
          setAuthNotice(null);
        }}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onUsernameChange={setLoginUsername}
        onSubmit={handleLoginSubmit}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  // ============================================================================
  // RENDER 2: LANGKAH 1 ONBOARDING - MASUKKAN LINK & SOSIAL MEDIA
  // ============================================================================
  if (step === 'step-links') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        <header className="px-6 py-5 flex items-center justify-between max-w-4xl w-full mx-auto">
          <button
            type="button"
            onClick={() => setStep('dashboard')}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Lewati ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar 33% */}
          <div className="w-48 sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-sky-500 rounded-full transition-all duration-300" />
          </div>

          <BrandMark muted />
        </header>

        <main className="flex-1 max-w-lg w-full mx-auto px-5 py-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Masukkan link Anda
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Tambahkan tautan utama dan akun sosial media yang ingin ditampilkan.
              </p>
            </div>

            {/* Quick Social Media Handles */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">
                Ikon Sosial Media Cepat
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: 'instagram',
                    label: 'Instagram',
                    icon: Instagram,
                    placeholder: 'https://instagram.com/...',
                  },
                  {
                    key: 'tiktok',
                    label: 'TikTok',
                    icon: Music2,
                    placeholder: 'https://tiktok.com/@...',
                  },
                  {
                    key: 'youtube',
                    label: 'YouTube',
                    icon: Youtube,
                    placeholder: 'https://youtube.com/@...',
                  },
                  {
                    key: 'website',
                    label: 'Website',
                    icon: Globe,
                    placeholder: 'https://example.com',
                  },
                  { key: 'email', label: 'Email', icon: Mail, placeholder: 'nama@email.com' },
                ].map((soc) => {
                  const Icon = soc.icon;
                  return (
                    <div
                      key={soc.key}
                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-sky-500"
                    >
                      <Icon className="w-4 h-4 text-sky-500 shrink-0" />
                      <input
                        type="text"
                        placeholder={soc.placeholder}
                        value={data.socials[soc.key as keyof SocialChannels]}
                        onChange={(e) =>
                          setData({
                            ...data,
                            socials: { ...data.socials, [soc.key]: e.target.value },
                          })
                        }
                        className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Add Custom Link */}
            <form
              onSubmit={handleOnboardingAddLink}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
            >
              <span className="text-xs font-semibold text-slate-700 block">
                Tambah Tautan Utama
              </span>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Judul Link (misal: Portfolio Website)"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={quickUrl}
                    onChange={(e) => setQuickUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </form>

            {/* Added Links List */}
            <div className="space-y-2">
              {data.links.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3"
                >
                  <div className="min-w-0 pr-3">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 truncate">
                      {item.type === 'group' && <FolderGit2 className="size-4 shrink-0 text-violet-600" />}
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.type === 'group'
                        ? `${data.links.filter((child) => child.groupId === item.id).length} tautan`
                        : item.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLinkItem(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 pb-4">
            <button
              type="button"
              onClick={() => setStep('step-profile')}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3.5 rounded-full transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================================
  // RENDER 3: LANGKAH 2 ONBOARDING - ATUR PROFILE & BANNER ("Add profile details")
  // ============================================================================
  if (step === 'step-profile') {
    return (
      <div
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1.25px, transparent 1.25px)',
          backgroundSize: '20px 20px',
        }}
        className="min-h-[100dvh] h-[100dvh] bg-white text-slate-900 flex flex-col justify-between overflow-hidden"
      >
        <header className="px-6 py-3 flex shrink-0 items-center justify-between max-w-4xl w-full mx-auto">
          <button
            type="button"
            onClick={() => setStep('step-links')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar 66% */}
          <div className="w-48 sm:w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-sky-500 rounded-full transition-all duration-300" />
          </div>

          <BrandMark />
        </header>

        <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-1">
          <LivePhoneMockup data={data} compact skeletonMode />
        </div>

        <div className="shrink-0 bg-white border-t border-slate-200 rounded-t-[32px] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] px-6 pt-4 pb-4">
          <div className="max-w-md mx-auto space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">Add profile details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Informasi ini akan tampil di bagian atas halaman bio Anda
              </p>
            </div>

            <div className="bg-slate-100 p-1 rounded-full grid grid-cols-2">
              <button
                type="button"
                onClick={() => setProfileOnboardingTab('profile')}
                className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  profileOnboardingTab === 'profile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setProfileOnboardingTab('header')}
                className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  profileOnboardingTab === 'header'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Header
              </button>
            </div>

            {profileOnboardingTab === 'profile' ? (
              <div className="flex items-center gap-3 py-1">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-sky-50">
                    <img
                      src={data.avatarUrl}
                      alt={data.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center border-2 border-white shadow-sm cursor-pointer"
                    title="Upload Foto Profil"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    type="text"
                    maxLength={30}
                    value={data.displayName}
                    onChange={(e) => setData({ ...data, displayName: e.target.value })}
                    placeholder={DEFAULT_TITLE}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                  <input
                    type="text"
                    maxLength={160}
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder={DEFAULT_BIO_PLACEHOLDER}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 py-1">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'classic', label: 'Classic' },
                      { id: 'banner', label: 'Banner' },
                      { id: 'hero', label: 'Hero' },
                    ] as { id: HeaderLayoutType; label: string }[]
                  ).map((item) => {
                    const selected = data.headerLayout === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setData({ ...data, headerLayout: item.id })}
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          selected
                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-3 pt-0.5">
                  {['#0EA5E9', '#0284C7', '#0F172A', '#434B72', '#38BDF8'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setData({ ...data, bannerColor: hex })}
                      style={{ backgroundColor: hex }}
                      aria-label={`Gunakan warna ${hex}`}
                      className={`w-8 h-8 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                        data.bannerColor === hex
                          ? 'ring-2 ring-offset-2 ring-sky-500 scale-105 border-slate-300'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                    >
                      {data.bannerColor === hex && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep('step-color')}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3 rounded-full transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 4: LANGKAH 3 ONBOARDING - PERSONALISASI WARNA ("Let's apply some color")
  // ============================================================================
  if (step === 'step-color') {
    return (
      <div
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1.25px, transparent 1.25px)',
          backgroundSize: '20px 20px',
        }}
        className="min-h-[100dvh] h-[100dvh] bg-white text-slate-900 flex flex-col justify-between overflow-hidden"
      >
        <header className="px-6 py-3 flex shrink-0 items-center justify-between max-w-4xl w-full mx-auto">
          <button
            type="button"
            onClick={() => setStep('step-profile')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar 100% */}
          <div className="w-48 sm:w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-sky-500 rounded-full transition-all duration-300" />
          </div>

          <BrandMark />
        </header>

        <div className="flex-1 min-h-0 flex items-center justify-center px-4 py-1">
          <LivePhoneMockup data={data} compact skeletonMode />
        </div>

        <div className="shrink-0 bg-white border-t border-slate-200 rounded-t-[32px] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] px-6 pt-4 pb-4">
          <div className="max-w-md mx-auto space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">Let&apos;s apply some color</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih warna solid untuk latar wallpaper dan tombol link Anda
              </p>
            </div>

            <div className="bg-slate-100 p-1 rounded-full grid grid-cols-2">
              <button
                type="button"
                onClick={() => setColorOnboardingTab('wallpaper')}
                className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${colorOnboardingTab === 'wallpaper'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Wallpaper
              </button>
              <button
                type="button"
                onClick={() => setColorOnboardingTab('buttons')}
                className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${colorOnboardingTab === 'buttons'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Buttons
              </button>
            </div>

            {colorOnboardingTab === 'wallpaper' ? (
              <div className="grid grid-cols-5 gap-2 justify-items-center py-0">
                {WALLPAPER_SWATCHES.map((swatch) => {
                  const isSelected = data.wallpaperColor.toUpperCase() === swatch.hex;
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setData({ ...data, wallpaperColor: swatch.hex })}
                      title={swatch.name}
                      style={{ backgroundColor: swatch.hex }}
                      className={`w-9 h-9 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${isSelected
                        ? 'ring-2 ring-offset-2 ring-sky-500 scale-105 border-slate-300'
                        : 'border-slate-300 hover:scale-105'
                        }`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 ${swatch.darkText ? 'text-slate-900' : 'text-white'}`}
                        />
                      )}
                    </button>
                  );
                })}
                <label
                  title="Warna Kustom"
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer relative overflow-hidden"
                >
                  <Palette className="w-4 h-4" />
                  <input
                    type="color"
                    value={data.wallpaperColor}
                    onChange={(e) => setData({ ...data, wallpaperColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-3 justify-items-center py-1">
                {BUTTON_SWATCHES.map((swatch) => {
                  const isSelected = data.buttonColor.toUpperCase() === swatch.bg;
                  return (
                    <button
                      key={swatch.bg}
                      type="button"
                      onClick={() =>
                        setData({
                          ...data,
                          buttonColor: swatch.bg,
                          buttonTextColor: swatch.text,
                        })
                      }
                      title={swatch.name}
                      style={{ backgroundColor: swatch.bg }}
                      className={`w-9 h-9 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${isSelected
                        ? 'ring-2 ring-offset-2 ring-sky-500 scale-105 border-slate-300'
                        : 'border-slate-300 hover:scale-105'
                        }`}
                    >
                      {isSelected && <Check style={{ color: swatch.text }} className="w-4 h-4" />}
                    </button>
                  );
                })}
                <label
                  title="Warna Tombol Kustom"
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer relative overflow-hidden"
                >
                  <Palette className="w-4 h-4" />
                  <input
                    type="color"
                    value={data.buttonColor}
                    onChange={(e) =>
                      setData({
                        ...data,
                        buttonColor: e.target.value,
                        buttonTextColor: isColorLight(e.target.value) ? '#0F172A' : '#FFFFFF',
                      })
                    }
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep('transition')}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-3 rounded-full transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 5: TRANSISI "Looking good. Let's keep building..."
  // ============================================================================
  if (step === 'transition') {
    const lightCanvas = isColorLight(data.wallpaperColor);
    return (
      <div
        style={{ backgroundColor: data.wallpaperColor }}
        className="min-h-screen flex flex-col items-center justify-between px-4 py-10 transition-colors duration-300"
      >
        <div className="text-center space-y-3">
          <BrandMark />
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${lightCanvas ? 'text-slate-900' : 'text-white'
              }`}
          >
            Looking good.
            <br />
            Let&apos;s keep building...
          </h1>
        </div>

        <div className="my-auto py-4">
          <LivePhoneMockup data={data} compact skeletonMode tilted3D />
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 6: DASHBOARD UTAMA
  // ============================================================================
  if (dashboardView === 'overview') {
    const activeLinks = actualLinks.filter((link) => link.active).length;
    const totalClicks = actualLinks.reduce((total, link) => total + link.clicks, 0);
    const setupSteps = [
      Boolean(data.avatarUrl && data.avatarUrl !== DEFAULT_AVATAR_URL),
      isCustomTitle(data.displayName),
      Boolean(data.username.trim()),
      isCustomBio(data.bio),
      actualLinks.length > 0,
      Object.values(data.socials).some(Boolean),
    ];
    const setupCompleted = setupSteps.filter(Boolean).length;
    const setupPercent = Math.round((setupCompleted / setupSteps.length) * 100);
    const setupRingCircumference = 2 * Math.PI * 18;

    const sidebarItems = [
      { label: 'My BioLink', icon: LayoutGrid, section: 'overview' as DashboardSection },
      { label: 'Messaging', icon: MessageCircle, section: 'messaging' as DashboardSection },
      { label: 'Audience', icon: Users, section: 'audience' as DashboardSection },
      { label: 'Insights', icon: BarChart3, section: 'insights' as DashboardSection },
      { label: 'Discoverability', icon: Globe, section: 'discoverability' as DashboardSection },
    ];

    const toolItems = [
      { label: 'Business cards', icon: UserSquare2, section: 'business-cards' as DashboardSection },
      { label: 'Social planner', icon: CalendarDays, section: 'social-planner' as DashboardSection },
      {
        label: 'Instagram auto-reply',
        icon: Instagram,
        section: 'instagram-auto-reply' as DashboardSection,
      },
      { label: 'Link shortener', icon: ExternalLink, section: 'link-shortener' as DashboardSection },
    ];

    return (
      <div className="min-h-screen bg-[#f7f7f8] text-slate-950">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[238px] flex-col border-r border-slate-200/80 bg-white lg:flex">
          <div className="flex h-[72px] items-center px-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex min-w-0 items-center gap-2.5 rounded-xl text-left"
              >
                <img
                  src={accountAvatar}
                  alt=""
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 w-[120px]">
                  <p className="truncate text-xs font-bold text-slate-900">{accountName}</p>
                  <p className="truncate text-[10px] text-slate-400">{data.accountEmail}</p>
                </div>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
              {showProfileMenu && (
                <div
                  onMouseLeave={() => setShowProfileMenu(false)}
                  className="absolute left-0 top-11 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg z-50"
                >
                  <button
                    type="button"
                    onClick={() => void createProfile()}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-50"
                  >
                    <Plus className="size-3.5" /> Tambah BioLink
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setDashboardSection('settings');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="size-3.5" /> Pengaturan Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setDashboardView('editor');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="size-3.5" /> Edit Halaman
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="size-3.5" /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-3 py-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setDashboardSection(item.section)}
                  className={`mb-0.5 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${dashboardSection === item.section
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}

            <p className="mb-1 mt-5 px-3 text-[11px] font-medium text-slate-400">Tools</p>
            {toolItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setDashboardSection(item.section)}
                  className="mb-0.5 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {setupPercent < 100 && (
              <div className="m-3 mb-4 rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative grid size-12 place-items-center">
                    <svg viewBox="0 0 44 44" className="absolute inset-0 size-12 -rotate-90">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="#ede9fe" strokeWidth="5" />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${(setupPercent / 100) * setupRingCircumference} ${setupRingCircumference}`}
                      />
                    </svg>
                    <span className="text-xs font-bold text-violet-600">
                      {setupPercent}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Your setup checklist</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {setupCompleted} of 6 complete
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setDashboardSection('setup')}
                  className="h-9 w-full rounded-full bg-violet-600 text-xs font-semibold hover:bg-violet-700"
                >
                  Finish setup
                </Button>
              </div>
            )}

          <button
            type="button"
            onClick={() => setDashboardSection('settings')}
            className="mx-3 mb-3 flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <Settings className="size-4" />
            Settings
          </button>
        </aside>

        <main className="lg:pl-[238px]">
          <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200/70 bg-white/95 px-4 backdrop-blur lg:px-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() => setDashboardView('editor')}
            >
              <PanelLeft className="size-5" />
            </Button>
            <div className="hidden text-sm font-medium text-slate-500 sm:block">Dashboard</div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyShareUrl}
                className="rounded-full border-slate-200 text-xs"
              >
                {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
                {copied ? 'Copied' : 'Share'}
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                className="grid size-9 place-items-center rounded-full border border-slate-200 text-slate-500 lg:hidden"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1120px] px-4 py-7 sm:px-8">
            {dashboardSection !== 'overview' ? (
              <section className="mx-auto max-w-[900px]">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => setDashboardSection('overview')}
                      className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      <ArrowLeft className="size-3.5" /> Back to dashboard
                    </button>
                    <h1 className="text-[23px] font-bold tracking-tight">
                      {(
                        {
                          overview: 'Dashboard',
                          messaging: 'Messaging',
                          audience: 'Audience',
                          insights: 'Insights',
                          discoverability: 'Discoverability',
                          'business-cards': 'Business cards',
                          'social-planner': 'Social planner',
                          'instagram-auto-reply': 'Instagram auto-reply',
                          'link-shortener': 'Link shortener',
                          setup: 'Setup checklist',
                          settings: 'Settings',
                        } as Record<DashboardSection, string>
                      )[dashboardSection]}
                    </h1>
                  </div>
                </div>

                {dashboardSection === 'setup' && (
                  <Card className="rounded-[18px] border-slate-200 shadow-none">
                    <CardContent className="space-y-3 p-5">
                      {[
                        ['Profile photo', Boolean(data.avatarUrl && data.avatarUrl !== DEFAULT_AVATAR_URL), 'header'],
                        ['Display name', isCustomTitle(data.displayName), 'header'],
                        ['Username', Boolean(data.username), 'header'],
                        ['Short bio', isCustomBio(data.bio), 'header'],
                        ['Add at least one link', actualLinks.length > 0, 'content'],
                        ['Add a social channel', Object.values(data.socials).some(Boolean), 'header'],
                      ].map(([label, complete, tab]) => (
                        <button
                          key={String(label)}
                          type="button"
                          onClick={() => {
                            setDashboardView('editor');
                            setDashboardTab(tab as DashboardTab);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-violet-300"
                        >
                          <span
                            className={`grid size-8 place-items-center rounded-full ${complete
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-400'
                              }`}
                          >
                            {complete ? <Check className="size-4" /> : <Plus className="size-4" />}
                          </span>
                          <span className="flex-1 text-sm font-semibold">{String(label)}</span>
                          <ChevronRight className="size-4 text-slate-400" />
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {dashboardSection === 'settings' && (
                  <div className="space-y-4">
                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardHeader className="px-5 py-4">
                        <CardTitle className="text-sm">Tema</CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-5">
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Wallpaper, warna, dan gaya tombol
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Atur tampilan publik halaman Biolink Anda.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="shrink-0 rounded-full"
                            onClick={() => {
                              setDashboardView('editor');
                              setDashboardTab('design');
                            }}
                          >
                            <Palette className="size-4" /> Atur Tema
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardHeader className="px-5 py-4">
                        <CardTitle className="text-sm">Username</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 px-5 pb-5">
                        <div className="flex rounded-xl border border-slate-200">
                          <span className="px-3 py-2.5 text-sm text-slate-400">biolink.id/</span>
                          <input
                            value={data.username}
                            maxLength={30}
                            onChange={(e) =>
                              setData((prev) => ({
                                ...prev,
                                username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                              }))
                            }
                            className="min-w-0 flex-1 rounded-r-xl px-1 py-2.5 text-sm outline-none"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleSaveSettings}
                          className="rounded-full bg-violet-600 hover:bg-violet-700"
                        >
                          Simpan Username
                        </Button>
                      </CardContent>
                    </Card>

                    {authProvider === 'email' && (
                      <Card className="rounded-[18px] border-slate-200 shadow-none">
                        <CardHeader className="px-5 py-4">
                          <CardTitle className="text-sm">Ganti Password</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 px-5 pb-5 md:grid-cols-2">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Password baru"
                            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                          />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Konfirmasi password"
                            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                          />
                          <div className="md:col-span-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleChangePassword}
                              className="rounded-full"
                            >
                              Ganti Password
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="rounded-[18px] border-rose-200 bg-rose-50/40 shadow-none">
                      <CardHeader className="px-5 py-4">
                        <CardTitle className="text-sm text-rose-700">Zona Berbahaya</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between gap-4 px-5 pb-5">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Hapus akun</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Menghapus profil dan semua data halaman Biolink.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDeleteAccount}
                          className="shrink-0 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="size-4" /> Hapus Akun
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {dashboardSection === 'discoverability' && (
                  <div className="space-y-4">
                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardHeader className="px-5 py-4">
                        <CardTitle className="text-sm">Pengaturan SEO</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 px-5 pb-5">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold">Judul halaman</label>
                          <input
                            value={data.seoTitle}
                            onChange={(e) =>
                              setData((prev) => ({ ...prev, seoTitle: e.target.value }))
                            }
                            placeholder={data.displayName || data.username}
                            maxLength={60}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                          />
                          <p className="mt-1 text-[11px] text-slate-400">
                            {(data.seoTitle || data.displayName).length}/60 karakter
                          </p>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold">
                            Deskripsi halaman
                          </label>
                          <textarea
                            value={data.seoDescription}
                            onChange={(e) =>
                              setData((prev) => ({ ...prev, seoDescription: e.target.value }))
                            }
                            placeholder={data.bio || 'Deskripsi singkat halaman Biolink Anda'}
                            maxLength={160}
                            className="min-h-24 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                          />
                          <p className="mt-1 text-[11px] text-slate-400">
                            {(data.seoDescription || data.bio).length}/160 karakter
                          </p>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Mencegah indeks mesin pencari
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Aktifkan <strong>noindex</strong> jika halaman belum ingin muncul di
                              Google.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setData((prev) => ({ ...prev, noIndex: !prev.noIndex }))
                            }
                            className={`h-6 w-11 shrink-0 rounded-full p-0.5 ${data.noIndex ? 'bg-violet-600' : 'bg-slate-200'
                              }`}
                            aria-label="Aktifkan noindex"
                          >
                            <span
                              className={`block size-5 rounded-full bg-white transition-transform ${data.noIndex ? 'translate-x-5' : ''
                                }`}
                            />
                          </button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardHeader className="px-5 py-4">
                        <CardTitle className="text-sm">Pratinjau hasil pencarian</CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-5">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-[12px] text-emerald-700">
                            {getPublicProfileUrl(data.username)}
                          </p>
                          <p className="mt-1 text-lg font-medium text-sky-700">
                            {data.seoTitle || data.displayName || data.username}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            {data.seoDescription || data.bio || 'Deskripsi halaman Biolink Anda.'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {dashboardSection === 'messaging' && (
                  <Card className="rounded-[18px] border-slate-200 shadow-none">
                    <CardContent className="p-5">
                      <label className="mb-2 block text-sm font-semibold">Announcement</label>
                      <textarea
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                        placeholder="Write a message to your audience..."
                        className="min-h-32 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (!draftMessage.trim()) return showToast('Tuliskan pesan terlebih dahulu');
                          showToast('Pesan berhasil disimpan');
                        }}
                        className="mt-3 rounded-full bg-violet-600 hover:bg-violet-700"
                      >
                        Save draft
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {dashboardSection === 'audience' && (
                  <div className="space-y-4">
                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">Audience Manager</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Simpan email pengunjung yang memberikan izin, lalu gunakan daftar ini
                              untuk update, promo, atau komunikasi pribadi.
                            </p>
                          </div>
                          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                            {audienceList.length} kontak
                          </span>
                        </div>

                        <form onSubmit={handleAddAudienceContact} className="flex gap-2">
                          <input
                            type="email"
                            required
                            maxLength={320}
                            value={audienceEmail}
                            onChange={(e) => setAudienceEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                          />
                          <Button
                            type="submit"
                            className="rounded-full bg-violet-600 hover:bg-violet-700"
                          >
                            <Plus className="size-4" /> Tambah
                          </Button>
                        </form>
                        <p className="mt-2 text-[11px] text-slate-500">
                          Tambahkan kontak yang sudah memberi izin untuk menerima update.
                        </p>
                        {audienceFeedback && (
                          <p role="status" className="mt-2 text-xs text-slate-600">
                            {audienceFeedback}
                          </p>
                        )}

                        <div className="mt-4 flex gap-2">
                          <input
                            type="search"
                            value={audienceQuery}
                            onChange={(e) => setAudienceQuery(e.target.value)}
                            placeholder="Cari audience..."
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            disabled={audienceList.length === 0}
                            onClick={() => {
                              const csv = [
                                'Email',
                                ...audienceList.map((contact) =>
                                  `"${contact.email.replace(/"/g, '""')}"`,
                                ),
                              ].join('\n');
                              const url = URL.createObjectURL(
                                new Blob([csv], { type: 'text/csv;charset=utf-8' })
                              );
                              const anchor = document.createElement('a');
                              anchor.href = url;
                              anchor.download = `${data.username || 'biolink'}-audience.csv`;
                              anchor.click();
                              URL.revokeObjectURL(url);
                              setAudienceFeedback('Daftar audience berhasil diekspor.');
                            }}
                          >
                            <Download className="size-4" /> Ekspor
                          </Button>
                        </div>

                        <div className="mt-4 space-y-2">
                          {audienceList
                            .filter((contact) =>
                              contact.email.includes(audienceQuery.trim().toLowerCase())
                            )
                            .map((contact) => (
                              <div
                                key={contact.id}
                                className="flex items-center rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                              >
                                <Mail className="mr-2 size-4 text-slate-400" />
                                <span className="flex-1 truncate">{contact.email}</span>
                                <button
                                  type="button"
                                  onClick={() => void handleRemoveAudienceContact(contact)}
                                  className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                  title="Hapus audience"
                                  aria-label={`Hapus ${contact.email}`}
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            ))}

                          {audienceLoading && (
                            <p className="py-4 text-center text-sm text-slate-500">
                              Memuat audience...
                            </p>
                          )}
                          {!audienceLoading && audienceList.length === 0 && (
                            <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">
                              Belum ada kontak audience.
                            </p>
                          )}
                          {audienceList.length > 0 &&
                            audienceList.filter((email) =>
                              email.email.includes(audienceQuery.trim().toLowerCase())
                            ).length === 0 && (
                              <p className="py-4 text-center text-sm text-slate-500">
                                Tidak ada audience yang cocok.
                              </p>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {dashboardSection === 'insights' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-700">Performa seluruh link</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
                        Data klik kumulatif
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <Card className="rounded-[18px] border-slate-200 shadow-none">
                        <CardContent className="p-5">
                          <p className="text-xs text-slate-500">Total klik link</p>
                          <p className="mt-2 text-3xl font-bold">{totalClicks}</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-[18px] border-slate-200 shadow-none">
                        <CardContent className="p-5">
                          <p className="text-xs text-slate-500">Link aktif</p>
                          <p className="mt-2 text-3xl font-bold">{activeLinks}</p>
                        </CardContent>
                      </Card>
                      <Card className="rounded-[18px] border-slate-200 shadow-none">
                        <CardContent className="p-5">
                          <p className="text-xs text-slate-500">Rata-rata per link aktif</p>
                          <p className="mt-2 text-3xl font-bold">
                            {activeLinks === 0 ? 0 : (totalClicks / activeLinks).toFixed(1)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardHeader className="flex-row items-center justify-between gap-3 px-5 py-4">
                        <CardTitle className="text-sm">Link paling sering diklik</CardTitle>
                        <div className="flex rounded-full bg-slate-100 p-1">
                          {(
                            [
                              ['horizontal', 'Batang'],
                              ['vertical', 'Kolom'],
                              ['donut', 'Donut'],
                            ] as const
                          ).map(([type, label]) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setLinkChartType(type)}
                              className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${linkChartType === type
                                ? 'bg-white text-violet-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-5">
                        {actualLinks.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                            Belum ada link untuk dianalisis.
                          </div>
                        ) : (
                          (() => {
                            const sortedLinks = [...actualLinks].sort((a, b) => b.clicks - a.clicks);
                            const maxClicks = Math.max(
                              ...sortedLinks.map((link) => link.clicks),
                              1
                            );
                            const chartColors = [
                              '#8b5cf6',
                              '#ec4899',
                              '#0ea5e9',
                              '#f59e0b',
                              '#10b981',
                              '#64748b',
                            ];

                            if (linkChartType === 'vertical') {
                              return (
                                <div className="mt-2 overflow-x-auto">
                                  <div className="flex h-64 min-w-[420px] items-end gap-3 border-b border-slate-200 px-2">
                                    {sortedLinks.map((link, index) => (
                                      <div
                                        key={link.id}
                                        className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                                      >
                                        <span className="text-[10px] font-bold text-slate-600">
                                          {link.clicks}
                                        </span>
                                        <div
                                          className="w-full max-w-14 rounded-t-lg transition-all"
                                          style={{
                                            height: `${Math.max((link.clicks / maxClicks) * 180, link.clicks > 0 ? 8 : 2)}px`,
                                            backgroundColor:
                                              chartColors[index % chartColors.length],
                                          }}
                                          title={`${link.title}: ${link.clicks} klik`}
                                        />
                                        <p className="h-8 w-full overflow-hidden text-center text-[9px] leading-3 text-slate-500 line-clamp-2">
                                          {link.title}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            if (linkChartType === 'donut') {
                              const total = sortedLinks.reduce((sum, link) => sum + link.clicks, 0);
                              let runningPercent = 0;
                              const segments = sortedLinks.map((link, index) => {
                                const percent = total === 0 ? 0 : (link.clicks / total) * 100;
                                const segment = `${chartColors[index % chartColors.length]} ${runningPercent}% ${runningPercent + percent}%`;
                                runningPercent += percent;
                                return segment;
                              });

                              return (
                                <div className="grid items-center gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
                                  <div
                                    className="relative mx-auto size-44 rounded-full"
                                    style={{
                                      background:
                                        total === 0
                                          ? '#f1f5f9'
                                          : `conic-gradient(${segments.join(', ')})`,
                                    }}
                                  >
                                    <div className="absolute inset-[28px] grid place-items-center rounded-full bg-white text-center">
                                      <div>
                                        <p className="text-2xl font-bold text-slate-900">{total}</p>
                                        <p className="text-[10px] text-slate-500">total klik</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2.5">
                                    {sortedLinks.map((link, index) => {
                                      const percent =
                                        total === 0 ? 0 : Math.round((link.clicks / total) * 100);
                                      return (
                                        <div key={link.id} className="flex items-center gap-2 text-xs">
                                          <span
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{
                                              backgroundColor:
                                                chartColors[index % chartColors.length],
                                            }}
                                          />
                                          <span className="min-w-0 flex-1 truncate text-slate-700">
                                            {link.title}
                                          </span>
                                          <span className="font-bold text-slate-800">
                                            {link.clicks}
                                          </span>
                                          <span className="w-10 text-right text-slate-400">
                                            {percent}%
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-4">
                                {sortedLinks.map((link, index) => {
                                  const width = (link.clicks / maxClicks) * 100;
                                  return (
                                    <div key={link.id}>
                                      <div className="mb-1.5 flex items-center gap-2">
                                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                                          {index + 1}
                                        </span>
                                        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">
                                          {link.title}
                                        </p>
                                        <span className="text-xs font-bold text-slate-600">
                                          {link.clicks} klik
                                        </span>
                                      </div>
                                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className="h-full rounded-full transition-all"
                                          style={{
                                            width: `${width}%`,
                                            backgroundColor:
                                              chartColors[index % chartColors.length],
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {dashboardSection === 'business-cards' && (
                  <div className="space-y-4">
                    {showBusinessCardIntro && (
                      <div className="relative rounded-[18px] border border-slate-200 bg-white px-5 py-5">
                        <button
                          type="button"
                          onClick={() => setShowBusinessCardIntro(false)}
                          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100"
                          aria-label="Close"
                        >
                          <X className="size-4" />
                        </button>
                        <h2 className="pr-8 text-center text-sm font-bold">
                          Create a digital business card for your Google or Apple Wallet
                        </h2>
                        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                          {[
                            ['QR', 'Let people scan the QR code for a shortcut to your BioLink'],
                            ['Share', 'They can share your card with a shortcut'],
                            ['Save', 'New contacts appear in your Audience Manager'],
                          ].map(([icon, text]) => (
                            <div key={icon} className="px-2">
                              <div className="mx-auto mb-2 grid size-8 place-items-center rounded-lg border border-slate-200">
                                {icon === 'QR' ? (
                                  <QrCode className="size-4" />
                                ) : icon === 'Share' ? (
                                  <Share2 className="size-4" />
                                ) : (
                                  <Users className="size-4" />
                                )}
                              </div>
                              <p className="text-[11px] leading-4 text-slate-600">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
                      <Card className="h-fit overflow-hidden rounded-[18px] border-slate-200 shadow-none">
                        <CardContent
                          className="flex min-h-[290px] flex-col p-5"
                          style={{ backgroundColor: businessCardColor }}
                        >
                          <img
                            src={data.avatarUrl}
                            alt={businessCardName || data.displayName}
                            className="mb-3 size-12 rounded-full border-2 border-white/80 object-cover shadow-sm"
                          />
                          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-800">
                            Name
                          </div>
                          <p className="mt-1 truncate text-[13px] font-bold text-slate-950">
                            {businessCardName || data.displayName}
                          </p>
                          {data.accountEmail && (
                            <p className="mt-1 truncate text-[9px] text-slate-700">
                              {data.accountEmail}
                            </p>
                          )}
                          <div className="mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-800">
                            URL
                          </div>
                          <p className="mt-1 truncate text-[11px] font-semibold text-slate-700">
                            {getPublicProfileUrl(data.username).replace(/^https?:\/\//, '')}
                          </p>
                          <a
                            href={getPublicProfileUrl(data.username)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open public BioLink"
                            className="mt-auto rounded-lg bg-white p-2.5 shadow-sm"
                          >
                            <div
                              id="business-card-qr"
                              className="mx-auto flex h-[118px] w-[118px] items-center justify-center rounded bg-white"
                            >
                              <QRCodeSVG
                                value={getPublicProfileUrl(data.username)}
                                size={118}
                                level="M"
                                bgColor="#FFFFFF"
                                fgColor="#101828"
                                marginSize={1}
                              />
                            </div>
                          </a>
                        </CardContent>
                      </Card>

                      <Card className="rounded-[18px] border-slate-200 shadow-none">
                        <CardContent className="space-y-5 p-5">
                          <div>
                            <h3 className="text-sm font-bold">Card style</h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Set your display name, background color and QR destination.
                            </p>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                              Display name
                            </label>
                            <input
                              value={businessCardName}
                              maxLength={30}
                              onChange={(e) => setBusinessCardName(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-700">
                              Background color
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                '#B8F34A',
                                '#F28D2F',
                                '#FF6B65',
                                '#D95B5B',
                                '#2487E8',
                                '#6DBB67',
                                '#1F2937',
                                '#C66DAD',
                              ].map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setBusinessCardColor(color)}
                                  style={{ backgroundColor: color }}
                                  className={`size-8 rounded-full border-2 border-white shadow-sm ${businessCardColor === color
                                    ? 'ring-2 ring-slate-800 ring-offset-2'
                                    : ''
                                    }`}
                                  aria-label={`Use ${color}`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={handleDownloadBusinessCardQr}
                              className="rounded-full bg-slate-950 px-5 text-xs hover:bg-slate-800"
                            >
                              <Download className="size-4" /> Download QR
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleShareBusinessCard}
                              className="rounded-full px-5 text-xs"
                            >
                              <Share2 className="size-4" /> Share card
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  getPublicProfileUrl(data.username),
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                              className="rounded-full px-5 text-xs"
                            >
                              <ExternalLink className="size-4" /> Open link
                            </Button>
                            {saveContactEnabled && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleDownloadVCard}
                                className="rounded-full px-5 text-xs"
                              >
                                <Phone className="size-4" /> Download contact
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div>
                          <p className="text-sm font-semibold">
                            Let visitors share their details back
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Collect a name and email from people who follow your BioLink.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShareDetailsBack((value) => !value)}
                          className={`h-6 w-11 shrink-0 rounded-full p-0.5 ${shareDetailsBack ? 'bg-violet-600' : 'bg-slate-200'
                            }`}
                        >
                          <span
                            className={`block size-5 rounded-full bg-white transition-transform ${shareDetailsBack ? 'translate-x-5' : ''
                              }`}
                          />
                        </button>
                      </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border-slate-200 shadow-none">
                      <CardContent className="p-5">
                        <button
                          type="button"
                          onClick={() => setSaveContactEnabled((value) => !value)}
                          className="flex w-full items-center justify-between text-left"
                        >
                          <div>
                            <p className="text-sm font-semibold">Let visitors save your contact</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Enable a downloadable contact card from this business card.
                            </p>
                          </div>
                          <span className="ml-4 flex shrink-0 items-center gap-2">
                            {!showContactFields && <Plus className="size-4 text-slate-500" />}
                            <span
                              className={`h-6 w-11 rounded-full p-0.5 ${saveContactEnabled ? 'bg-violet-600' : 'bg-slate-200'
                                }`}
                            >
                              <span
                                className={`block size-5 rounded-full bg-white transition-transform ${saveContactEnabled ? 'translate-x-5' : ''
                                  }`}
                              />
                            </span>
                          </span>
                        </button>

                        {saveContactEnabled && (
                          <button
                            type="button"
                            onClick={() => setShowContactFields((value) => !value)}
                            className="mt-3 text-xs font-semibold text-violet-600"
                          >
                            {showContactFields ? 'Hide contact details' : 'Edit contact details'}
                          </button>
                        )}

                        {saveContactEnabled && showContactFields && (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold">Phone</label>
                              <input
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="+62..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold">Email</label>
                              <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {dashboardSection === 'social-planner' && (
                  <Card className="rounded-[18px] border-slate-200 shadow-none">
                    <CardContent className="space-y-3 p-5">
                      <textarea
                        value={plannedPost}
                        onChange={(e) => setPlannedPost(e.target.value)}
                        placeholder="Post caption..."
                        className="min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={plannedDate}
                        onChange={(e) => setPlannedDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (!plannedPost.trim() || !plannedDate)
                            return showToast('Lengkapi caption dan jadwal');
                          showToast('Post berhasil dijadwalkan');
                        }}
                        className="rounded-full bg-violet-600 hover:bg-violet-700"
                      >
                        Schedule post
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {dashboardSection === 'instagram-auto-reply' && (
                  <Card className="rounded-[18px] border-slate-200 shadow-none">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">Auto-reply</p>
                          <p className="text-xs text-slate-500">Reply to new direct messages</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAutoReplyEnabled((prev) => !prev)}
                          className={`w-11 rounded-full p-0.5 ${autoReplyEnabled ? 'bg-violet-600' : 'bg-slate-200'
                            }`}
                        >
                          <span
                            className={`block size-5 rounded-full bg-white transition-transform ${autoReplyEnabled ? 'translate-x-5' : ''
                              }`}
                          />
                        </button>
                      </div>
                      <textarea
                        value={autoReplyMessage}
                        onChange={(e) => setAutoReplyMessage(e.target.value)}
                        className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => showToast('Auto-reply berhasil disimpan')}
                        className="rounded-full bg-violet-600 hover:bg-violet-700"
                      >
                        Save auto-reply
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {dashboardSection === 'link-shortener' && (
                  <Card className="rounded-[18px] border-slate-200 shadow-none">
                    <CardContent className="p-5">
                      <p className="mb-2 text-sm font-semibold">Public link</p>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={getPublicProfileUrl(data.username)}
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        />
                        <Button type="button" onClick={handleCopyShareUrl} className="rounded-full">
                          <Copy className="size-4" /> Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>
            ) : (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <h1 className="text-[23px] font-bold tracking-tight">
                    Good morning, {data.displayName}
                  </h1>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDashboardView('editor')}
                      className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white sm:flex"
                    >
                      BioLink/{data.username}
                      <Share2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <section>
                  <h2 className="mb-4 text-[15px] font-bold">Your BioLink</h2>
                  <div className="flex flex-wrap items-center gap-4">
                    {profiles.map((profile) => {
                      const isActive = profile.id === activeProfileId;
                      const profileName =
                        profile.display_name?.trim() || profile.username || 'Untitled BioLink';

                      return (
                        <Card
                          key={profile.id}
                          className={`inline-block w-[218px] overflow-hidden rounded-[17px] border-0 p-0 text-left text-white shadow-sm ${
                            isActive ? 'bg-[#4d6688]' : 'bg-[#607784]'
                          }`}
                        >
                          <div className="w-full">
                            <button
                              type="button"
                              onClick={() =>
                                void (isActive
                                  ? setDashboardView('editor')
                                  : switchProfile(profile.id, true))
                              }
                              className="w-full text-left cursor-pointer"
                            >
                            <div
                              className="relative h-[228px] overflow-hidden"
                              style={{
                                backgroundImage: `linear-gradient(180deg, rgba(15,23,42,.05), rgba(15,23,42,.72)), url(${
                                  profile.avatar_url || INITIAL_STATE.avatarUrl
                                })`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                            >
                              <div className="absolute inset-x-0 bottom-3 px-3">
                                <p className="truncate text-[14px] font-bold">{profileName}</p>
                                <p className="mt-0.5 text-[11px] text-white/75">
                                  {isActive
                                    ? `${activeLinks} ${activeLinks === 1 ? 'link' : 'links'}`
                                    : 'BioLink'}
                                </p>
                              </div>
                            </div>
                            </button>
                            <div className="flex h-[50px] items-center justify-between px-3">
                              <span className="min-w-0 truncate text-[13px] font-bold">
                                {profileName}
                              </span>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => void deleteProfile(profile.id)}
                                  className="grid size-7 place-items-center rounded-full bg-white/15 text-white hover:bg-rose-500 cursor-pointer"
                                  aria-label={`Hapus ${profileName}`}
                                  title="Hapus BioLink"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void (isActive
                                      ? setDashboardView('editor')
                                      : switchProfile(profile.id, true))
                                  }
                                  className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 cursor-pointer"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => void createProfile()}
                      className="group grid h-[278px] w-[218px] place-items-center rounded-[17px] border-2 border-dashed border-slate-300 bg-white text-slate-400 transition-colors hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 cursor-pointer"
                      aria-label="Tambah BioLink"
                      title="Tambah BioLink"
                    >
                      <span className="grid size-12 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-colors group-hover:border-violet-200 group-hover:text-violet-600">
                        <Plus className="size-6" strokeWidth={2} />
                      </span>
                    </button>
                  </div>
                </section>

                <section className="mt-8">
                  <h2 className="mb-4 text-[15px] font-bold">In the last week</h2>
                  <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                    <Card
                      role="button"
                      tabIndex={0}
                      onClick={() => setDashboardSection('insights')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setDashboardSection('insights');
                      }}
                      className="min-h-[230px] cursor-pointer rounded-[18px] border-slate-200 shadow-none transition-colors hover:border-violet-300"
                    >
                      <CardHeader className="flex-row items-center justify-between px-5 py-4">
                        <CardTitle className="text-[13px]">BioLink visitors</CardTitle>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          All time <ChevronRight className="size-3.5" />
                        </span>
                      </CardHeader>
                      <CardContent className="px-5">
                        {totalClicks === 0 ? (
                          <p className="text-[12px] text-slate-500">No activity during this time</p>
                        ) : (
                          <div className="mt-5">
                            <p className="text-3xl font-bold">{totalClicks}</p>
                            <p className="mt-1 text-xs text-slate-500">Total link clicks</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card
                      role="button"
                      tabIndex={0}
                      onClick={() => setDashboardSection('audience')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setDashboardSection('audience');
                      }}
                      className="hidden min-h-[230px] cursor-pointer overflow-hidden rounded-[18px] border-slate-200 shadow-none transition-colors hover:border-violet-300 md:block"
                    >
                      <CardHeader className="flex-row items-start justify-between px-5 py-4">
                        <CardTitle className="text-[13px]">Audience growth</CardTitle>
                        <span className="text-xs font-semibold text-violet-600">
                          +{audienceGrowthThisWeek} minggu ini
                        </span>
                      </CardHeader>
                      <CardContent className="px-5">
                        <p className="mb-1 text-[11px] text-slate-500">
                          {audienceList.length} total subscribers
                        </p>
                        {audienceLoading ? (
                          <p className="py-10 text-center text-xs text-slate-500">
                            Memuat pertumbuhan audience...
                          </p>
                        ) : audienceFeedback.startsWith('Gagal') ? (
                          <p className="py-10 text-center text-xs text-rose-600">
                            {audienceFeedback}
                          </p>
                        ) : audienceList.length === 0 ? (
                          <p className="py-10 text-center text-xs text-slate-500">
                            Belum ada subscriber. Bagikan halaman bio untuk mulai mengumpulkan audience.
                          </p>
                        ) : (
                          <>
                            <svg
                              viewBox="0 0 280 128"
                              role="img"
                              aria-label="Grafik pertumbuhan subscriber selama tujuh hari terakhir"
                              className="h-[104px] w-full"
                            >
                              <line x1="8" y1="108" x2="272" y2="108" stroke="#f1f5f9" />
                              <line x1="8" y1="66" x2="272" y2="66" stroke="#f1f5f9" />
                              <line x1="8" y1="24" x2="272" y2="24" stroke="#f1f5f9" />
                              <polyline
                                points={audienceGrowthPoints}
                                fill="none"
                                stroke="#7c3aed"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                              />
                              {audienceGrowthSeries.map(({ x, y, total, label }) => (
                                <circle
                                  key={label}
                                  cx={x}
                                  cy={y}
                                  r="2.5"
                                  fill="#7c3aed"
                                >
                                  <title>{`${label}: ${total} subscribers`}</title>
                                </circle>
                              ))}
                            </svg>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>{audienceGrowthSeries[0].label}</span>
                              <span>{audienceGrowthSeries[6].label}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{ borderColor: data.buttonColor }}
          className="fixed right-4 top-16 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border-2 bg-white px-4 py-3 pr-11 text-sm font-medium text-slate-800 shadow-lg"
        >
          {toastMessage}
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => {
              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = null;
              setToastMessage(null);
            }}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-[#F3F4F6]/95 backdrop-blur-sm px-4 sm:px-6 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left Hamburger / Stats */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setDashboardSection('overview');
              setDashboardView('overview');
              void refreshProfiles();
            }}
            className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-violet-600"
            title="Kembali ke Dashboard"
          >
            <PanelLeft className="size-4" />
          </button>
          {syncStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <Loader2 className="size-3 animate-spin" />
              Menyimpan...
            </span>
          )}
          {syncStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600">
              <Check className="size-3" />
              Tersimpan di cloud
            </span>
          )}
          {syncStatus === 'error' && (
            <span
              role="alert"
              title={syncError || undefined}
              className="text-[11px] text-rose-600"
            >
              Gagal menyimpan
            </span>
          )}
        </div>

        {/* Center Account Dropdown Pill */}
        <div className="relative justify-self-center">
          <button
            type="button"
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className="flex items-center gap-2.5 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
          >
            <img
              src={accountAvatar}
              alt={accountName}
              className="w-6 h-6 rounded-full object-cover bg-sky-100"
            />
            <span className="max-w-[160px] sm:max-w-[220px] truncate">{accountName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showAccountMenu && (
            <div
              onMouseLeave={() => setShowAccountMenu(false)}
              className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-40 space-y-1"
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{accountName}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {data.accountEmail || `biolink.id/${data.username}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  void createProfile();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah BioLink
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar Akun
              </button>
            </div>
          )}
        </div>

        {/* Right Share / Copy Link Button */}
        <div className="justify-self-end flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareUrl}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-800 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-sky-500" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-sky-500" />
            )}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* MOBILE EDITOR / PREVIEW SWITCHER */}
      <div className="lg:hidden px-4 pb-3">
        <div className="bg-white border border-slate-200 rounded-full p-1 grid grid-cols-2">
          <button
            type="button"
            onClick={() => setMobileDashMode('editor')}
            className={`py-2 rounded-full text-xs font-semibold transition-colors ${mobileDashMode === 'editor' ? 'bg-sky-500 text-white' : 'text-slate-600'
              }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileDashMode('preview')}
            className={`py-2 rounded-full text-xs font-semibold transition-colors ${mobileDashMode === 'preview' ? 'bg-sky-500 text-white' : 'text-slate-600'
              }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1440px] w-full mx-auto px-3 sm:px-6 pb-8 gap-4 lg:gap-6">
        {/* LEFT VERTICAL ICON RAIL */}
        <aside
          className={`lg:w-16 flex lg:flex-col items-center justify-center lg:justify-start lg:pt-28 gap-4 ${mobileDashMode === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
        >
          {(
            [
              { id: 'content', label: 'Content', icon: LayoutGrid },
              { id: 'header', label: 'Header', icon: UserSquare2 },
              { id: 'design', label: 'Design', icon: Paintbrush },
            ] as { id: DashboardTab; label: string; icon: React.FC<{ className?: string }> }[]
          ).map((nav) => {
            const Icon = nav.icon;
            const active = dashboardTab === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setDashboardTab(nav.id)}
                className="group flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${active
                    ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-600'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-semibold ${active ? 'text-sky-600' : 'text-slate-500'
                    }`}
                >
                  {nav.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* CENTER-LEFT WHITE ROUNDED EDITOR CARD */}
        <section
          className={`flex-1 max-w-2xl w-full mx-auto lg:mx-0 bg-white border border-slate-200/90 rounded-[32px] p-5 sm:p-8 shadow-2xs ${mobileDashMode === 'preview' ? 'hidden lg:block' : 'block'
            }`}
        >
          {/* TAB A: CONTENT */}
          {dashboardTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Content</h2>
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-sky-500" />
                  QR Code
                </button>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={data.avatarUrl}
                  alt={data.displayName}
                  className="w-16 h-16 rounded-full object-cover border border-slate-200 bg-sky-50 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 truncate">
                    {data.displayName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {[
                      { icon: Instagram, label: 'Instagram' },
                      { icon: Music2, label: 'TikTok' },
                      { icon: MessageCircle, label: 'WhatsApp' },
                      { icon: Mail, label: 'Email' },
                    ].map((s, idx) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDashboardTab('header')}
                          title={`Atur ${s.label}`}
                          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 hover:border-sky-400 hover:text-sky-600 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setDashboardTab('header')}
                      className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit Sosial Media"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 flex items-center justify-between gap-4">
                <span className="pb-2.5 border-b-2 border-sky-500 text-sm font-semibold text-slate-900">
                  Links ({actualLinks.length}) · Groups ({linkGroups.length})
                </span>
                {data.links.length > 1 && (
                  <span className="pb-2 text-[11px] text-slate-400">
                    Geser ikon titik untuk mengubah urutan
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setStep('step-links')}
                  className="py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 text-slate-600" />
                  Quick Setup Links
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="py-3 px-4 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Link
                </button>
                <button
                  type="button"
                  onClick={openCreateGroupModal}
                  className="py-3 px-4 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FolderGit2 className="w-4 h-4" />
                  Add Group
                </button>
              </div>

              <div className="space-y-3">
                {data.links.map((link, index) => (
                  <div
                    key={link.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedLinkIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(index));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverLinkIndex !== index) {
                        setDragOverLinkIndex(index);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverLinkIndex === index) {
                        setDragOverLinkIndex(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex =
                        draggedLinkIndex !== null
                          ? draggedLinkIndex
                          : Number(e.dataTransfer.getData('text/plain'));
                      handleReorderLinks(fromIndex, index);
                      setDraggedLinkIndex(null);
                      setDragOverLinkIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedLinkIndex(null);
                      setDragOverLinkIndex(null);
                    }}
                    className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 transition-all ${draggedLinkIndex === index
                      ? 'opacity-45 scale-[0.98] border-sky-400'
                      : dragOverLinkIndex === index
                        ? 'border-sky-500 ring-2 ring-sky-100 bg-sky-50/30'
                        : link.active
                          ? 'opacity-100 border-slate-200'
                          : 'opacity-55 bg-slate-50 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <span
                        title="Tahan & geser untuk mengurutkan"
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>
                      {link.type === 'group' ? (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
                          <FolderGit2 className="size-4" />
                        </div>
                      ) : renderLinkIcon(link) ? (
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                          {renderLinkIcon(link, 'w-4 h-4')}
                        </div>
                      ) : getLinkIconUrl(link) ? (
                        <img
                          src={getLinkIconUrl(link)!}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                          <Link2 className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {link.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {link.type === 'group'
                            ? `${data.links.filter((child) => child.groupId === link.id).length} tautan`
                            : `${link.clicks} clicks • ${link.groupId
                              ? `Kelompok: ${data.links.find((item) => item.id === link.groupId)?.title || '—'}`
                              : link.url.replace(/^https?:\/\//, '')}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            links: prev.links.map((l) =>
                              l.id === link.id ? { ...l, active: !l.active } : l
                            ),
                          }))
                        }
                        aria-label={`Aktifkan/Nonaktifkan ${link.type === 'group' ? 'kelompok' : 'tautan'}`}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${link.active ? 'bg-sky-500' : 'bg-slate-200'
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${link.active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>

                      {link.type !== 'group' && (
                        <button
                          type="button"
                          onClick={() => setActiveShareLink(link)}
                          className="p-2 rounded-full text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
                          title="Share link"
                          aria-label={`Bagikan ${link.title}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditModal(link)}
                        className="p-2 rounded-full text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLinkItem(link)}
                        className="p-2 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        title={link.type === 'group' ? 'Hapus kelompok' : 'Hapus tautan'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {data.links.length === 0 && (
                  <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center text-xs text-slate-500">
                    Belum ada link. Klik tombol <strong>+ Add</strong> di atas untuk menambahkan.
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    BioLink footer badge
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 inline-flex items-center gap-1">
                    biolink <span className="text-sky-500">*</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateDataWithHistory((prev) => ({
                      ...prev,
                      showFooterBadge: !prev.showFooterBadge,
                    }))
                  }
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${data.showFooterBadge ? 'bg-sky-500' : 'bg-slate-200'
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${data.showFooterBadge ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB B: HEADER */}
          {dashboardTab === 'header' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Header</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                  onClick={() => void handleManualProfileSave()}
                    className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2.5">Layout</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { id: 'classic', label: 'Classic' },
                      { id: 'hero', label: 'Hero' },
                      { id: 'banner', label: 'Banner' },
                      { id: 'shape', label: 'Shape' },
                    ] as { id: HeaderLayoutType; label: string }[]
                  ).map((layout) => {
                    const selected = data.headerLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({ ...prev, headerLayout: layout.id }))
                        }
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${selected
                          ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                      >
                        <div className="w-full h-14 rounded-xl bg-slate-100 mb-2.5 overflow-hidden flex items-center justify-center relative">
                          {layout.id === 'banner' && (
                            <div
                              style={{ backgroundColor: data.bannerColor }}
                              className="w-full h-5 absolute top-0"
                            />
                          )}
                          {layout.id === 'hero' ? (
                            <img
                              src={data.avatarUrl}
                              alt="Hero preview"
                              className="w-full h-full object-cover"
                            />
                          ) : layout.id === 'shape' ? (
                            <img
                              src={data.avatarUrl}
                              alt="Shape preview"
                              className="w-9 h-9 object-cover relative z-10"
                              style={getProfileShapeStyle(data.profileShape)}
                            />
                          ) : (
                            <img
                              src={data.avatarUrl}
                              alt="Avatar preview"
                              className="w-8 h-8 rounded-full object-cover border-2 border-white relative z-10 mt-1"
                            />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{layout.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {data.headerLayout === 'banner' && (
                <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-xs font-semibold text-slate-900">
                        Banner image / video
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Unggah gambar atau video untuk bagian atas.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <Upload className="size-3.5" /> Upload
                    </button>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </div>
                  {data.bannerUrl && (
                    <div className="relative h-20 overflow-hidden rounded-xl">
                      {data.bannerUrl.startsWith('data:video/') ? (
                        <video
                          src={data.bannerUrl}
                          muted
                          autoPlay
                          loop
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={data.bannerUrl}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => updateDataWithHistory((prev) => ({ ...prev, bannerUrl: '' }))}
                        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-slate-500"
                        title="Hapus banner"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-700">Warna fallback</span>
                    <div className="flex items-center gap-2">
                      {['#0EA5E9', '#0284C7', '#38BDF8', '#0F172A', '#434B72'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() =>
                            updateDataWithHistory((prev) => ({ ...prev, bannerColor: hex }))
                          }
                          style={{ backgroundColor: hex }}
                          className={`size-7 rounded-full border-2 ${data.bannerColor === hex ? 'scale-110 border-slate-900' : 'border-white'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {data.headerLayout === 'shape' && (
                <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-slate-800">Shape</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {(
                        [
                          ['circle', 'Circle'],
                          ['loop', 'Loop'],
                          ['flower', 'Flower'],
                          ['oval', 'Oval'],
                          ['rounded', 'Rounded'],
                          ['burst', 'Burst'],
                        ] as [ProfileShape, string][]
                      ).map(([shape, label]) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() =>
                            updateDataWithHistory((prev) => ({ ...prev, profileShape: shape }))
                          }
                          className={`flex flex-col items-center gap-2 rounded-xl border p-2.5 text-[10px] font-semibold ${data.profileShape === shape
                            ? 'border-sky-500 bg-sky-50/40 text-sky-700'
                            : 'border-slate-200 text-slate-600'
                            }`}
                        >
                          <span
                            className="size-9 bg-slate-400"
                            style={getProfileShapeStyle(shape)}
                          />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Profile image</span>
                  <span className="text-[11px] text-slate-400">Unggah foto profil baru</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 hover:border-sky-400 hover:text-sky-600 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                  <div className="relative">
                    <img
                      src={data.avatarUrl}
                      alt={data.displayName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                <label className="text-xs font-semibold text-slate-700 pt-3">Username</label>
                <div className="sm:col-span-2">
                  <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-sky-500">
                    <span className="shrink-0 border-r border-slate-100 px-3 py-3 text-sm text-slate-400">
                      BioLink/
                    </span>
                    <input
                      type="text"
                      maxLength={30}
                      value={data.username}
                      onChange={(e) =>
                        updateDataWithHistory((prev) => ({
                          ...prev,
                          username: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ''),
                        }))
                      }
                      className="min-w-0 flex-1 px-3 py-3 text-sm text-slate-900 outline-none"
                      placeholder="john-doe"
                    />
                  </div>
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {data.username.length}/30
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                <label className="text-xs font-semibold text-slate-700 pt-3">Title</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    maxLength={30}
                    value={data.displayName}
                    onChange={(e) =>
                      updateDataWithHistory((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    placeholder={DEFAULT_TITLE}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {data.displayName.length}/30
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
                <label className="text-xs font-semibold text-slate-700 pt-3">Bio</label>
                <div className="sm:col-span-2">
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={data.bio}
                    onChange={(e) =>
                      updateDataWithHistory((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder={DEFAULT_BIO_PLACEHOLDER}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 resize-none"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {data.bio.length}/160
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Social media</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Tambahkan akun atau tautan yang ditampilkan di bawah profil.
                    </p>
                  </div>
                  {Object.values(data.socials).some((value) => Boolean(value?.trim())) && (
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-600">
                      Aktif
                    </span>
                  )}
                </div>

                <div className="grid gap-2.5">
                  {(
                    [
                      {
                        key: 'instagram',
                        label: 'Instagram',
                        icon: Instagram,
                        placeholder: 'https://instagram.com/username',
                      },
                      {
                        key: 'tiktok',
                        label: 'TikTok',
                        icon: Music2,
                        placeholder: 'https://tiktok.com/@username',
                      },
                      {
                        key: 'whatsapp',
                        label: 'WhatsApp',
                        icon: MessageCircle,
                        placeholder: '628123456789',
                      },
                      {
                        key: 'youtube',
                        label: 'YouTube',
                        icon: Youtube,
                        placeholder: 'https://youtube.com/@channel',
                      },
                      {
                        key: 'website',
                        label: 'Website',
                        icon: Globe,
                        placeholder: 'https://example.com',
                      },
                      { key: 'email', label: 'Email', icon: Mail, placeholder: 'nama@email.com' },
                    ] as const
                  ).map((social) => {
                    const Icon = social.icon;
                    const socialKey = social.key as keyof SocialChannels;
                    return (
                      <div
                        key={social.key}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-sky-500"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500">
                          <Icon className="size-4" />
                        </span>
                        <label className="w-20 shrink-0 text-xs font-semibold text-slate-700">
                          {social.label}
                        </label>
                        <input
                          type={social.key === 'email' ? 'email' : 'text'}
                          value={data.socials[socialKey] || ''}
                          onChange={(e) =>
                            updateDataWithHistory((prev) => ({
                              ...prev,
                              socials: {
                                ...prev.socials,
                                [socialKey]: e.target.value,
                              },
                            }))
                          }
                          placeholder={social.placeholder}
                          className="min-w-0 flex-1 text-xs text-slate-900 outline-none placeholder:text-slate-400"
                        />
                        {data.socials[socialKey] && (
                          <button
                            type="button"
                            onClick={() =>
                              updateDataWithHistory((prev) => ({
                                ...prev,
                                socials: {
                                  ...prev.socials,
                                  [socialKey]: '',
                                },
                              }))
                            }
                            className="grid size-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title={`Hapus ${social.label}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Title color</span>
                <label className="inline-flex items-center gap-2.5 border border-slate-200 rounded-2xl px-3.5 py-2 cursor-pointer hover:border-sky-400">
                  <span
                    style={{ backgroundColor: data.titleColor }}
                    className="w-5 h-5 rounded-md border border-slate-300"
                  />
                  <span className="text-xs font-mono text-slate-700 uppercase">
                    {data.titleColor}
                  </span>
                  <input
                    type="color"
                    value={data.titleColor}
                    onChange={(e) =>
                      updateDataWithHistory((prev) => ({ ...prev, titleColor: e.target.value }))
                    }
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB C: DESIGN */}
          {dashboardTab === 'design' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {designPanel !== 'menu' && (
                    <button
                      type="button"
                      onClick={() => setDesignPanel('menu')}
                      className="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                      title="Kembali"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                  )}
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {designPanel === 'menu'
                      ? 'Design'
                      : (
                        {
                          theme: 'Theme',
                          wallpaper: 'Wallpaper',
                          buttons: 'Buttons',
                          text: 'Text',
                          colors: 'Colors',
                          stickers: 'Stickers',
                          footer: 'Footer',
                        } as Record<Exclude<DesignPanel, 'menu'>, string>
                      )[designPanel]}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleManualProfileSave()}
                    className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              {designPanel === 'menu' && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setDesignPanel('theme')}
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-slate-200 px-4 py-3.5 text-left transition-colors hover:border-slate-300"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-700 text-sm font-bold text-white">
                      Aa
                    </span>
                    <span className="flex-1 text-sm font-semibold text-slate-800">Theme</span>
                    <span className="text-xs text-slate-400">Custom</span>
                    <ChevronRight className="size-4 text-slate-400" />
                  </button>

                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-slate-500">Customize</p>
                    {(
                      [
                        ['wallpaper', 'Wallpaper', 'Solid Fill', '■'],
                        [
                          'buttons',
                          'Buttons',
                          data.buttonVariant.charAt(0).toUpperCase() + data.buttonVariant.slice(1),
                          '●',
                        ],
                        ['text', 'Text', data.fontFamily, 'Aa'],
                        ['colors', 'Colors', '', '▮'],
                        ['stickers', 'Stickers', 'Decorate your page', '⌇'],
                        ['footer', 'Footer', data.showFooterBadge ? 'Visible' : 'Hidden', '✣'],
                      ] as [DesignPanel, string, string, string][]
                    ).map(([panel, label, detail, mark]) => (
                      <button
                        key={panel}
                        type="button"
                        onClick={() => setDesignPanel(panel)}
                        className="flex w-full items-center gap-3.5 rounded-2xl border border-slate-200 px-4 py-3.5 text-left transition-colors hover:border-slate-300"
                      >
                        <span
                          className={`grid size-11 shrink-0 place-items-center rounded-xl border text-base ${panel === 'wallpaper'
                            ? 'border-slate-300'
                            : panel === 'buttons'
                              ? 'border-slate-200'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                          style={
                            panel === 'wallpaper'
                              ? { backgroundColor: data.wallpaperColor }
                              : panel === 'buttons'
                                ? {
                                  backgroundColor: data.buttonColor,
                                  color: data.buttonTextColor,
                                }
                                : undefined
                          }
                        >
                          {mark}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
                        {detail && <span className="text-xs text-slate-400">{detail}</span>}
                        <ChevronRight className="size-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {designPanel === 'theme' && (
                <div className="space-y-4">
                  <p className="text-xs leading-5 text-slate-500">
                    Pilih preset tema untuk menerapkan kombinasi latar, tombol, dan tipografi
                    sekaligus.
                  </p>
                  {[
                    {
                      name: 'Sky',
                      wallpaper: '#F0F9FF',
                      button: '#0EA5E9',
                      buttonText: '#FFFFFF',
                      titleText: '#0F172A',
                      font: 'DM Sans' as FontChoice,
                    },
                    {
                      name: 'Midnight',
                      wallpaper: '#0F172A',
                      button: '#FFFFFF',
                      buttonText: '#0F172A',
                      titleText: '#FFFFFF',
                      font: 'Inter' as FontChoice,
                    },
                    {
                      name: 'Blush',
                      wallpaper: '#F5D5EA',
                      button: '#18181B',
                      buttonText: '#FFFFFF',
                      titleText: '#0F172A',
                      font: 'Plus Jakarta Sans' as FontChoice,
                    },
                    {
                      name: 'Espresso',
                      wallpaper: '#433A31',
                      button: '#F5DFC6',
                      buttonText: '#433A31',
                      titleText: '#FFFFFF',
                      font: 'DM Sans' as FontChoice,
                    },
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() =>
                        updateDataWithHistory((prev) => ({
                          ...prev,
                          wallpaperColor: theme.wallpaper,
                          buttonColor: theme.button,
                          buttonTextColor: theme.buttonText,
                          titleColor: theme.titleText,
                          fontFamily: theme.font,
                        }))
                      }
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left hover:border-sky-300"
                    >
                      <span
                        className="h-14 w-20 rounded-xl border border-slate-200"
                        style={{ backgroundColor: theme.wallpaper }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{theme.name}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{theme.font}</p>
                      </div>
                      <ChevronRight className="size-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {designPanel === 'wallpaper' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Fill</p>
                      <p className="mt-1 text-xs text-slate-400">Warna latar halaman</p>
                    </div>
                    <label
                      className="size-10 cursor-pointer rounded-full border-2 border-white shadow ring-1 ring-slate-200"
                      style={{ backgroundColor: data.wallpaperColor }}
                    >
                      <input
                        type="color"
                        value={data.wallpaperColor}
                        onChange={(e) =>
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            wallpaperColor: e.target.value,
                          }))
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {WALLPAPER_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            wallpaperColor: swatch.hex,
                          }))
                        }
                        title={swatch.name}
                        style={{ backgroundColor: swatch.hex }}
                        className={`aspect-square rounded-2xl border ${data.wallpaperColor.toUpperCase() === swatch.hex
                          ? 'ring-2 ring-sky-500 ring-offset-2 border-slate-400'
                          : 'border-slate-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {designPanel === 'buttons' && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-slate-700">Style</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['solid', 'outline', 'soft'] as ButtonVariant[]).map((variant) => (
                        <button
                          key={variant}
                          type="button"
                          onClick={() =>
                            updateDataWithHistory((prev) => ({ ...prev, buttonVariant: variant }))
                          }
                          className={`rounded-full border py-2.5 text-xs font-semibold capitalize ${data.buttonVariant === variant
                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-slate-200 text-slate-600'
                            }`}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-slate-700">Color</p>
                    <div className="grid grid-cols-5 gap-3">
                      {BUTTON_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.bg}
                          type="button"
                          onClick={() =>
                            updateDataWithHistory((prev) => ({
                              ...prev,
                              buttonColor: swatch.bg,
                              buttonTextColor: swatch.text,
                            }))
                          }
                          title={swatch.name}
                          style={{ backgroundColor: swatch.bg }}
                          className={`aspect-square rounded-full border ${data.buttonColor.toUpperCase() === swatch.bg
                            ? 'ring-2 ring-sky-500 ring-offset-2 border-slate-400'
                            : 'border-slate-300'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {designPanel === 'text' && (
                <div className="space-y-3">
                  {(['DM Sans', 'Inter', 'Plus Jakarta Sans', 'JetBrains Mono'] as FontChoice[]).map(
                    (font) => (
                      <button
                        key={font}
                        type="button"
                        onClick={() =>
                          updateDataWithHistory((prev) => ({ ...prev, fontFamily: font }))
                        }
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 ${data.fontFamily === font
                          ? 'border-sky-500 bg-sky-50/40'
                          : 'border-slate-200'
                          }`}
                      >
                        <span className="text-sm font-semibold text-slate-800">{font}</span>
                        {data.fontFamily === font && <Check className="size-4 text-sky-600" />}
                      </button>
                    )
                  )}
                </div>
              )}

              {designPanel === 'colors' && (
                <div className="space-y-4">
                  {[
                    [
                      'Title',
                      data.titleColor,
                      (color: string) =>
                        updateDataWithHistory((prev) => ({ ...prev, titleColor: color })),
                    ],
                    [
                      'Wallpaper',
                      data.wallpaperColor,
                      (color: string) =>
                        updateDataWithHistory((prev) => ({ ...prev, wallpaperColor: color })),
                    ],
                    [
                      'Button',
                      data.buttonColor,
                      (color: string) =>
                        updateDataWithHistory((prev) => ({ ...prev, buttonColor: color })),
                    ],
                  ].map(([label, value, onChange]) => (
                    <label
                      key={String(label)}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                    >
                      <span className="text-sm font-semibold text-slate-800">{String(label)}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase text-slate-500">
                          {String(value)}
                        </span>
                        <span
                          className="size-9 rounded-full border border-slate-300"
                          style={{ backgroundColor: String(value) }}
                        />
                        <input
                          type="color"
                          value={String(value)}
                          onChange={(e) => (onChange as (color: string) => void)(e.target.value)}
                          className="sr-only"
                        />
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {designPanel === 'stickers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Decorate your page</p>
                      <p className="mt-1 text-xs text-slate-400">Pilih hingga 8 sticker.</p>
                    </div>
                    {data.stickers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => updateDataWithHistory((prev) => ({ ...prev, stickers: [] }))}
                        className="text-xs font-semibold text-slate-500 hover:text-rose-600"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-slate-700">Open Stickers</p>
                    <div className="grid grid-cols-5 gap-2">
                      {OPEN_STICKERS.map((sticker) => (
                        <button
                          key={sticker}
                          type="button"
                          disabled={data.stickers.length >= 8}
                          onClick={() =>
                            updateDataWithHistory((prev) => ({
                              ...prev,
                              stickers: [
                                ...prev.stickers,
                                {
                                  src: sticker,
                                  x: 82,
                                  y: 54 + prev.stickers.length * 5,
                                  scale: 1,
                                },
                              ].slice(-8),
                            }))
                          }
                          className={`grid aspect-square place-items-center rounded-xl border text-2xl transition-transform hover:scale-105 ${data.stickers.some((item) => item.src === sticker)
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-slate-200'
                            } disabled:opacity-40`}
                        >
                          <img
                            src={sticker}
                            alt=""
                            className="size-10 object-contain"
                            draggable={false}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-slate-700">Sticker upload</p>
                    <button
                      type="button"
                      onClick={() => stickerInputRef.current?.click()}
                      disabled={data.stickers.length >= 8}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-5 text-xs font-semibold text-slate-600 hover:border-sky-400 hover:text-sky-600 disabled:opacity-40"
                    >
                      <Upload className="size-4" /> Upload sticker PNG
                    </button>
                    <input
                      ref={stickerInputRef}
                      type="file"
                      accept="image/png,image/webp,image/svg+xml"
                      onChange={handleStickerUpload}
                      className="hidden"
                    />
                  </div>

                  
                </div>
              )}

              {designPanel === 'footer' && (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Footer badge</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Tampilkan tombol Join di bagian bawah.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateDataWithHistory((prev) => ({
                        ...prev,
                        showFooterBadge: !prev.showFooterBadge,
                      }))
                    }
                    className={`h-6 w-11 rounded-full p-0.5 ${data.showFooterBadge ? 'bg-sky-500' : 'bg-slate-200'
                      }`}
                  >
                    <span
                      className={`block size-5 rounded-full bg-white transition-transform ${data.showFooterBadge ? 'translate-x-5' : ''
                        }`}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT SIDE: LIVE PHONE PREVIEW */}
        <section
          className={`flex-1 flex items-center justify-center py-4 lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:py-4 ${mobileDashMode === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
        >
          <div className="flex items-center justify-center gap-3">
            <LivePhoneMockup
              data={data}
              onLinkClick={handleIncrementClick}
              onShareLink={setActiveShareLink}
              stickersDraggable
              onStickerMove={(index, x, y) =>
                setData((prev) => ({
                  ...prev,
                  stickers: prev.stickers.map((sticker, stickerIndex) =>
                    stickerIndex === index ? { ...sticker, x, y } : sticker
                  ),
                }))
              }
              onStickerScale={(index, scale) =>
                setData((prev) => ({
                  ...prev,
                  stickers: prev.stickers.map((sticker, stickerIndex) =>
                    stickerIndex === index ? { ...sticker, scale } : sticker
                  ),
                }))
              }
              onStickerDelete={(index) =>
                updateDataWithHistory((prev) => ({
                  ...prev,
                  stickers: prev.stickers.filter((_, stickerIndex) => stickerIndex !== index),
                }))
              }
            />

            <div className="hidden sm:flex flex-col gap-2 bg-white border border-slate-200 p-1.5 rounded-full shadow-2xs">
              <button
                type="button"
                onClick={handleCopyShareUrl}
                title="Salin Link Publik"
                className="w-9 h-9 rounded-full hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                title="Buka QR & Share"
                className="w-9 h-9 rounded-full hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ADD / EDIT LINK MODAL */}
      {showAddLinkModal && (
        <div
          onClick={() => setShowAddLinkModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/35 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {modalItemType === 'group'
                  ? editingLink
                    ? 'Edit Kelompok'
                    : 'Tambah Kelompok'
                  : editingLink
                    ? 'Edit Link'
                    : 'Tambah Link Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLinkModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {modalItemType === 'group' ? 'Nama Kelompok' : 'Judul Tombol Link'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    modalItemType === 'group'
                      ? 'Contoh: Sosial Media'
                      : 'Contoh: Portfolio Website'
                  }
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {modalItemType === 'link' && (
                <>
                  <label className="block text-xs font-semibold text-slate-700">
                    Masukkan ke Kelompok
                    <select
                      value={modalGroupId}
                      onChange={(event) => setModalGroupId(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-normal text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                    >
                      <option value="">Tanpa kelompok</option>
                      {data.links
                        .filter((item) => item.type === 'group')
                        .map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.title}
                          </option>
                        ))}
                    </select>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      URL Tujuan
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://example.com"
                      value={modalUrl}
                      onChange={(e) => setModalUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      URL Gambar Preview <span className="font-normal text-slate-400">(opsional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Kosongkan untuk screenshot halaman otomatis"
                      value={modalThumbnailUrl}
                      onChange={(e) => setModalThumbnailUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        URL Icon Kiri
                      </label>
                      <span className="text-[10px] text-slate-400">Kosongkan untuk otomatis</span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://.../icon.png"
                      value={modalIconUrl}
                      onChange={(e) => setModalIconUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className={`w-full rounded-full py-3 text-sm font-semibold text-white transition-colors cursor-pointer ${
                  modalItemType === 'group'
                    ? 'bg-violet-600 hover:bg-violet-700'
                    : 'bg-sky-500 hover:bg-sky-600'
                }`}
              >
                {editingLink
                  ? 'Simpan Perubahan'
                  : modalItemType === 'group'
                    ? 'Tambahkan Kelompok'
                    : 'Tambahkan Link'}
              </button>

              {modalItemType === 'link' && (
                <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Icon Kiri Link
                  </label>
                  {modalIconUrl && (
                    <button
                      type="button"
                      onClick={() => setModalIconUrl('')}
                      className="text-[11px] font-medium text-rose-500 hover:underline cursor-pointer"
                    >
                      Reset ke otomatis
                    </button>
                  )}
                </div>

                {/* Grid Pilihan Icon Lucide */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {Object.entries(LINK_LUCIDE_ICONS).map(([key, { label, icon: IconComp }]) => {
                    const token = `lucide:${key}`;
                    const selected = modalIconUrl === token;
                    return (
                      <button
                        key={key}
                        type="button"
                        title={label}
                        onClick={() => setModalIconUrl(selected ? '' : token)}
                        className={`h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${selected
                            ? 'bg-sky-500 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-400 hover:text-sky-600'
                          }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>

                {/* Upload File Gambar atau Input URL Manual */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => linkIconInputRef.current?.click()}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:text-sky-600 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                  <input
                    ref={linkIconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLinkIconUpload}
                    className="hidden"
                  />
                  <input
                    type="text"
                    placeholder="Atau tempel URL icon / kosongkan untuk otomatis"
                    value={modalIconUrl.startsWith('lucide:') ? '' : modalIconUrl}
                    onChange={(e) => setModalIconUrl(e.target.value)}
                    className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {activeShareLink && (
        <div
          onClick={() => setActiveShareLink(null)}
          className="fixed inset-0 z-[60] bg-slate-900/35 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="bg-white rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Share link</h3>
              <button
                type="button"
                onClick={() => setActiveShareLink(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-4 text-center">
              {getLinkPreviewUrl(activeShareLink) ? (
                <LinkPreviewImage
                  link={activeShareLink}
                  className="w-full h-32 rounded-xl object-cover mb-3"
                  fallbackClassName="h-32 rounded-xl mb-3"
                />
              ) : getLinkIconUrl(activeShareLink) ? (
                <img
                  src={getLinkIconUrl(activeShareLink)!}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover mx-auto mb-3 bg-white"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <p className="font-bold text-sm line-clamp-2">{activeShareLink.title}</p>
              <p className="text-[11px] text-slate-300 mt-1 truncate">{activeShareLink.url}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(activeShareLink.url);
                  showToast('Link disalin');
                }}
                className="h-11 rounded-full border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" /> Copy link
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (navigator.share) {
                    await navigator.share({
                      title: activeShareLink.title,
                      url: activeShareLink.url,
                    });
                  } else {
                    navigator.clipboard?.writeText(activeShareLink.url);
                    showToast('Link disalin');
                  }
                }}
                className="h-11 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Bagikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE & QR MODAL */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/35 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-xl text-center space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Bagikan Halaman Bio</h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <SolidQRCode url={getPublicProfileUrl(data.username)} />
              <p className="font-bold text-sm text-slate-900 mt-3">{data.displayName}</p>
              <span className="text-xs font-medium text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full mt-1">
                biolink.id/{data.username}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyShareUrl}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs py-3 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Link Berhasil Disalin' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}