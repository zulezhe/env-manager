// 搜索查询接口
export interface SearchQuery {
  nameKeyword?: string;
  remarkKeyword?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 更新信息接口
export interface UpdateInfo {
  version: string;
  releaseNotes: string;
  downloadUrl: string;
}