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

export interface AdmCompanyInfo {
  compId: string;
  compName: string;
  compNameBng?: string | null;
  addressEng?: string | null;
  addressBng?: string | null;
  phoneNo?: string | null;
  shortNameEng?: string | null;
  shortNameBng?: string | null;
  email?: string | null;
  mailPort?: number | null;
  mailPass?: string | null;
  mailFrom?: string | null;
  setupCompWise?: boolean | null;
  logoFileName?: string | null;
  logoFileLocation?: string | null;
  comHeaderFileName?: string | null;
  comHeaderFileLocation?: string | null;
  signatoryFileName?: string | null;
  signatoryFileLoc?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface SaveAdmCompanyInfoRequest {
  compName: string;
  compNameBng?: string | null;
  addressEng?: string | null;
  addressBng?: string | null;
  phoneNo?: string | null;
  shortNameEng?: string | null;
  shortNameBng?: string | null;
  email?: string | null;
  mailPort?: number | null;
  mailPass?: string | null;
  mailFrom?: string | null;
  setupCompWise?: boolean | null;
  logoFileName?: string | null;
  logoFileLocation?: string | null;
  comHeaderFileName?: string | null;
  comHeaderFileLocation?: string | null;
  signatoryFileName?: string | null;
  signatoryFileLoc?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface UpdateAdmCompanyInfoRequest extends SaveAdmCompanyInfoRequest {
  compId: string;
}
