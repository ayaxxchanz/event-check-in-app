export function StoryOrnament({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 300" fill="none" aria-hidden="true">
      <path d="M95 290C140 225 62 130 149 22M108 252C49 233 38 190 27 159M106 219C163 203 182 164 188 133M104 177C68 162 57 123 61 94M119 123C163 104 176 71 174 45" stroke="currentColor" strokeWidth="1.5" />
      <g fill="currentColor">
        <path d="M52 209C21 208 16 184 14 175C37 178 50 186 52 209ZM73 238C43 241 31 223 28 213C54 212 67 222 73 238ZM41 187C19 176 20 153 22 144C40 156 44 170 41 187ZM146 198C147 170 165 158 176 155C174 178 164 192 146 198ZM169 172C169 147 184 134 196 129C196 152 187 167 169 172ZM80 149C56 147 46 127 46 114C67 121 79 132 80 149ZM68 124C51 108 56 86 61 76C76 94 77 108 68 124ZM142 103C144 79 160 69 171 67C167 87 158 99 142 103ZM135 47C119 30 126 10 131 3C145 20 146 34 135 47Z" opacity=".75" />
        <path d="m184 220 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9ZM30 57l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7ZM195 89l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
      </g>
      <circle cx="95" cy="55" r="3" stroke="currentColor" /><circle cx="202" cy="190" r="2" fill="currentColor" />
    </svg>
  );
}
