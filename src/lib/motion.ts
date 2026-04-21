export const duration = {
  instant: 0.08,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

export const ease = {
  default: [0.4, 0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: duration.normal, ease: ease.default },
};

export const slideIn = {
  initial: { x: -16, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -16, opacity: 0 },
  transition: { duration: duration.normal, ease: ease.default },
};

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: duration.fast, ease: ease.spring },
};

export const messageFadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.normal, ease: ease.default },
};
