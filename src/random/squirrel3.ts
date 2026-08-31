// inline uint32_t Squirrel3(int position, uint32_t seed = 0)
// {
export function squirrel3(position: number, seed = 0): number {
  //     // Define the original three bit-noise constants
  //     const uint32_t BIT_NOISE1 = 0xB5297A4D;
  const BIT_NOISE1 = 0xb5297a4d;
  //     const uint32_t BIT_NOISE2 = 0x68E31DA4;
  const BIT_NOISE2 = 0x68e31da4;
  //     const uint32_t BIT_NOISE3 = 0x1B56C4E9;
  const BIT_NOISE3 = 0x1b56c4e9;

  //     // Cast position to unsigned to force a standard bit-pattern representation
  //     uint32_t mangled = static_cast<uint32_t>(position);
  let mangled = position >>> 0;

  //     mangled *= BIT_NOISE1;
  mangled = Math.imul(mangled, BIT_NOISE1) >>> 0;
  //     mangled += seed;
  mangled = (mangled + seed) >>> 0;
  //     mangled ^= (mangled >> 8);
  mangled = (mangled ^ (mangled >>> 8)) >>> 0;
  //     mangled += BIT_NOISE2;
  mangled = (mangled + BIT_NOISE2) >>> 0;
  //     mangled ^= (mangled << 8);
  mangled = (mangled ^ ((mangled << 8) >>> 0)) >>> 0;
  //     mangled *= BIT_NOISE3;
  mangled = Math.imul(mangled, BIT_NOISE3) >>> 0;
  //     mangled ^= (mangled >> 8);
  mangled = (mangled ^ (mangled >>> 8)) >>> 0;

  return mangled;
}
