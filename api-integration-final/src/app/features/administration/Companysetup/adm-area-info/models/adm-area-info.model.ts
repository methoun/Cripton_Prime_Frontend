export interface ApiResult<T> {
  success?: boolean;
  message?: string;
  data?: T;
  result?: T;
  Success?: boolean;
  Message?: string;
  Data?: T;
  Result?: T;
}

export interface AdmAreaInfo {
  areaId: string;
  compId: string;
  areaName: string;
  areaNameBng?: string | null;
  areaAddressEng?: string | null;
  areaAddressBng?: string | null;
  shortName?: string | null;
  shortNameBng?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface SaveAdmAreaInfoRequest {
  compId: string;
  areaName: string;
  areaNameBng?: string | null;
  areaAddressEng?: string | null;
  areaAddressBng?: string | null;
  shortName?: string | null;
  shortNameBng?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface UpdateAdmAreaInfoRequest extends SaveAdmAreaInfoRequest {
  areaId: string;
}
