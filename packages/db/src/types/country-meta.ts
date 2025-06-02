import { Country } from './enums';

// Flags
export const COUNTRY_FLAGS: Record<Country, string> = {
  [Country.Albania]: 'https://flagcdn.com/al.svg',
  [Country.Algeria]: 'https://flagcdn.com/dz.svg',
  [Country.Bahrain]: 'https://flagcdn.com/bh.svg',
  [Country.Egypt]: 'https://flagcdn.com/eg.svg',
  [Country.Iran]: 'https://flagcdn.com/ir.svg',
  [Country.Iraq]: 'https://flagcdn.com/iq.svg',
  [Country.Jordan]: 'https://flagcdn.com/jo.svg',
  [Country.Kuwait]: 'https://flagcdn.com/kw.svg',
  [Country.Lebanon]: 'https://flagcdn.com/lb.svg',
  [Country.Libya]: 'https://flagcdn.com/ly.svg',
  [Country.Morocco]: 'https://flagcdn.com/ma.svg',
  [Country.Oman]: 'https://flagcdn.com/om.svg',
  [Country.Palestine]: 'https://flagcdn.com/ps.svg',
  [Country.Qatar]: 'https://flagcdn.com/qa.svg',
  [Country.SaudiArabia]: 'https://flagcdn.com/sa.svg',
  [Country.Syria]: 'https://flagcdn.com/sy.svg',
  [Country.Tunisia]: 'https://flagcdn.com/tn.svg',
  [Country.Turkey]: 'https://flagcdn.com/tr.svg',
  [Country.UnitedArabEmirates]: 'https://flagcdn.com/ae.svg',
  [Country.Yemen]: 'https://flagcdn.com/ye.svg',
};

// Phone Codes
export const PHONE_CODES: Record<Country, string> = {
  [Country.Albania]: '+355',
  [Country.Algeria]: '+213',
  [Country.Bahrain]: '+973',
  [Country.Egypt]: '+20',
  [Country.Iran]: '+98',
  [Country.Iraq]: '+964',
  [Country.Jordan]: '+962',
  [Country.Kuwait]: '+965',
  [Country.Lebanon]: '+961',
  [Country.Libya]: '+218',
  [Country.Morocco]: '+212',
  [Country.Oman]: '+968',
  [Country.Palestine]: '+970',
  [Country.Qatar]: '+974',
  [Country.SaudiArabia]: '+966',
  [Country.Syria]: '+963',
  [Country.Tunisia]: '+216',
  [Country.Turkey]: '+90',
  [Country.UnitedArabEmirates]: '+971',
  [Country.Yemen]: '+967',
};
