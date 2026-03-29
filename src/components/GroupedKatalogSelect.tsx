import React from 'react';
import Select, { GroupBase, StylesConfig } from 'react-select';

export interface KatalogOption {
  value: string;
  label: string;
  rumpun: string;
  prefix: string;
}

export interface KatalogGroup {
  label: string;
  options: KatalogOption[];
}

export const KATALOG_DATA: KatalogGroup[] = [
  {
    label: 'I. PERTANAHAN (LAN)',
    options: [
      { value: 'AJB', label: 'Akta Jual Beli (AJB)', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'HIBAH', label: 'Akta Hibah', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'APHB', label: 'Akta Pembagian Hak Bersama (APHB)', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'APHT', label: 'Akta Pemberian Hak Tanggungan (APHT)', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'SKMHT', label: 'SKMHT', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'TUKAR', label: 'Akta Tukar Menukar', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'HGB', label: 'HGB di atas Hak Milik', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'KUASA_JUAL', label: 'Surat Kuasa Menjual', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'ROYA', label: 'Penghapusan Hak Tanggungan (Roya)', rumpun: 'PERTANAHAN', prefix: 'LAN' },
      { value: 'PENINGKATAN', label: 'Peningkatan Hak (HGB ke HM)', rumpun: 'PERTANAHAN', prefix: 'LAN' },
    ],
  },
  {
    label: 'II. KENOTARIATAN (CORP)',
    options: [
      { value: 'PT', label: 'Pendirian PT', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'CV', label: 'Pendirian CV', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'YAYASAN', label: 'Yayasan / Perkumpulan', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'PAD', label: 'Perubahan Anggaran Dasar (PAD)', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'PKR', label: 'Pernyataan Keputusan Rapat (PKR)', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'FIRMA', label: 'Akta Pendirian Firma', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'BUBAR', label: 'Pembubaran Badan Hukum', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'CESSIE', label: 'Akta Pengalihan Saham (Cessie)', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'KOPERASI', label: 'Pendirian Koperasi', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
      { value: 'PT_PERORANGAN', label: 'PT Perorangan', rumpun: 'KENOTARIATAN', prefix: 'CORP' },
    ],
  },
  {
    label: 'III. WASIAT & WARIS (INH)',
    options: [
      { value: 'WASIAT', label: 'Akta Wasiat (Testamen)', rumpun: 'WASIAT & WARIS', prefix: 'INH' },
      { value: 'BATAL_WASIAT', label: 'Akta Pembatalan Wasiat', rumpun: 'WASIAT & WARIS', prefix: 'INH' },
      { value: 'HAK_WARIS', label: 'Akta Keterangan Hak Mewaris', rumpun: 'WASIAT & WARIS', prefix: 'INH' },
      { value: 'PISAH_HARTA', label: 'Akta Pemisahan Harta Peninggalan', rumpun: 'WASIAT & WARIS', prefix: 'INH' },
      { value: 'TOLAK_WARIS', label: 'Akta Penolakan Waris', rumpun: 'WASIAT & WARIS', prefix: 'INH' },
      { value: 'SERAH_WARIS', label: 'Akta Penyerahan Hak Waris', rumpun: 'WASIAT & WARIS', prefix: 'INH' },
      { value: 'PEMBAGIAN_WARIS', label: 'Akta Pembagian Warisan', rumpun: 'WASIAT & WARIS', prefix: 'INH' },
    ],
  },
  {
    label: 'IV. JAMINAN & KREDIT (FIN)',
    options: [
      { value: 'FIDUSIA', label: 'Jaminan Fidusia', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
      { value: 'PG', label: 'Personal Guarantee', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
      { value: 'HUTANG', label: 'Akta Pengakuan Hutang', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
      { value: 'PK', label: 'Perjanjian Kredit (PK)', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
      { value: 'NOVASI', label: 'Akta Novasi', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
      { value: 'SUBROGASI', label: 'Akta Subrogasi', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
      { value: 'CORPORATE_GUARANTEE', label: 'Corporate Guarantee', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
      { value: 'CESSIE_KREDIT', label: 'Cessie Piutang', rumpun: 'JAMINAN & KREDIT', prefix: 'FIN' },
    ],
  },
  {
    label: 'V. KELUARGA & PRIBADI (FAM)',
    options: [
      { value: 'PRENUP', label: 'Perjanjian Kawin (Prenuptial)', rumpun: 'KELUARGA & PRIBADI', prefix: 'FAM' },
      { value: 'UBAH_PRENUP', label: 'Perubahan Perjanjian Kawin', rumpun: 'KELUARGA & PRIBADI', prefix: 'FAM' },
      { value: 'ANAK', label: 'Akta Pengakuan Anak', rumpun: 'KELUARGA & PRIBADI', prefix: 'FAM' },
      { value: 'LEPAS_HAK', label: 'Akta Pelepasan Hak', rumpun: 'KELUARGA & PRIBADI', prefix: 'FAM' },
      { value: 'SEPAKAT', label: 'Akta Kesepakatan Bersama', rumpun: 'KELUARGA & PRIBADI', prefix: 'FAM' },
      { value: 'KEDUDUKAN', label: 'Surat Pernyataan Kedudukan', rumpun: 'KELUARGA & PRIBADI', prefix: 'FAM' },
      { value: 'HIBAH_WASIAT', label: 'Hibah Wasiat (Legaat)', rumpun: 'KELUARGA & PRIBADI', prefix: 'FAM' },
    ],
  },
  {
    label: 'VI. PERJANJIAN & LAINNYA (OTH)',
    options: [
      { value: 'SEWA', label: 'Perjanjian Sewa Menyewa', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
      { value: 'MOU', label: 'Perjanjian Kerjasama (MoU)', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
      { value: 'JUAL_SAHAM', label: 'Akta Jual Beli Saham', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
      { value: 'KUASA', label: 'Akta Kuasa', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
      { value: 'LEGALISASI', label: 'Legalisasi (Warmerking)', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
      { value: 'COPY', label: 'Copy Collatione', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
      { value: 'WAARMERKING', label: 'Pendaftaran Surat di Bawah Tangan', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
      { value: 'PROTES', label: 'Akta Protes', rumpun: 'PERJANJIAN & LAINNYA', prefix: 'OTH' },
    ],
  },
];

interface GroupedKatalogSelectProps {
  value?: KatalogOption | null;
  onChange: (option: KatalogOption | null) => void;
  placeholder?: string;
}

const customStyles: StylesConfig<KatalogOption, false, GroupBase<KatalogOption>> = {
  control: (base, state) => ({
    ...base,
    borderRadius: '8px',
    padding: '4px 8px',
    borderColor: state.isFocused ? '#C2A35D' : '#E2E8F0',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(194, 163, 93, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#C2A35D',
    },
    fontSize: '12px',
    backgroundColor: 'white',
  }),
  groupHeading: (base) => ({
    ...base,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'none',
    padding: '8px 12px',
    borderBottom: '1px solid #F1F5F9',
    marginBottom: '4px',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '12px',
    paddingLeft: '24px', // Indented as requested
    color: state.isSelected ? 'white' : '#1E293B',
    backgroundColor: state.isSelected ? '#C2A35D' : state.isFocused ? '#F8FAFC' : 'white',
    '&:active': {
      backgroundColor: '#C2A35D',
    },
    cursor: 'pointer',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 100,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94A3B8',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0F172A',
    fontWeight: '600',
  }),
};

export const GroupedKatalogSelect: React.FC<GroupedKatalogSelectProps> = ({ value, onChange, placeholder }) => {
  return (
    <Select<KatalogOption, false, GroupBase<KatalogOption>>
      options={KATALOG_DATA}
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Pilih Layanan/Katalog...'}
      styles={customStyles}
      isSearchable={true}
      classNamePrefix="notaris-select"
    />
  );
};
