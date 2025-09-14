import { EnvironmentVariable } from './types';

// 模拟环境变量数据
export const mockEnvironmentVariables: EnvironmentVariable[] = [
  // 用户环境变量
  {
    id: 'user-1',
    name: 'JAVA_HOME',
    value: 'C:\\Program Files\\Java\\jdk-17.0.2',
    type: 'user',
    remark: 'Java开发环境路径',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    isValid: true
  },
  {
    id: 'user-2',
    name: 'NODE_ENV',
    value: 'development',
    type: 'user',
    remark: 'Node.js环境配置',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    isValid: true
  },
  {
    id: 'user-3',
    name: 'PYTHON_PATH',
    value: 'C:\\Python39\\Scripts;C:\\Python39',
    type: 'user',
    remark: 'Python环境路径',
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z',
    isValid: true
  },
  {
    id: 'user-4',
    name: 'MAVEN_HOME',
    value: 'C:\\apache-maven-3.8.6',
    type: 'user',
    remark: 'Maven构建工具路径',
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
    isValid: true
  },
  {
    id: 'user-5',
    name: 'INVALID_VAR',
    value: 'C:\\NonExistentPath\\Invalid',
    type: 'user',
    remark: '无效的路径变量',
    createdAt: '2024-01-19T16:30:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    isValid: false
  },
  
  // 系统环境变量
  {
    id: 'system-1',
    name: 'PATH',
    value: 'C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0;C:\\Program Files\\Git\\cmd;C:\\Program Files\\nodejs;C:\\Users\\oliver\\AppData\\Roaming\\npm;C:\\Program Files\\Java\\jdk-17.0.2\\bin;C:\\apache-maven-3.8.6\\bin;C:\\Python39;C:\\Python39\\Scripts;C:\\Program Files\\Docker\\Docker\\resources\\bin;C:\\ProgramData\\DockerDesktop\\version-bin;C:\\Program Files\\Microsoft VS Code\\bin',
    type: 'system',
    remark: '系统路径环境变量',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
    isValid: true
  },
  {
    id: 'system-2',
    name: 'TEMP',
    value: 'C:\\Users\\oliver\\AppData\\Local\\Temp',
    type: 'system',
    remark: '临时文件目录',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    isValid: true
  },
  {
    id: 'system-3',
    name: 'TMP',
    value: 'C:\\Users\\oliver\\AppData\\Local\\Temp',
    type: 'system',
    remark: '临时文件目录（备用）',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    isValid: true
  },
  {
    id: 'system-4',
    name: 'USERPROFILE',
    value: 'C:\\Users\\oliver',
    type: 'system',
    remark: '用户配置文件目录',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    isValid: true
  },
  {
    id: 'system-5',
    name: 'PROGRAMFILES',
    value: 'C:\\Program Files',
    type: 'system',
    remark: '程序文件目录',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    isValid: true
  },
  {
    id: 'system-6',
    name: 'WINDIR',
    value: 'C:\\Windows',
    type: 'system',
    remark: 'Windows系统目录',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    isValid: true
  },
  {
    id: 'system-7',
    name: 'INVALID_SYSTEM_VAR',
    value: 'D:\\InvalidSystemPath',
    type: 'system',
    remark: '无效的系统变量',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    isValid: false
  },
  
  // 更多PATH类型的变量
  {
    id: 'user-6',
    name: 'CLASSPATH',
    value: '.;C:\\Program Files\\Java\\jdk-17.0.2\\lib\\dt.jar;C:\\Program Files\\Java\\jdk-17.0.2\\lib\\tools.jar;C:\\apache-maven-3.8.6\\lib\\*',
    type: 'user',
    remark: 'Java类路径',
    createdAt: '2024-01-21T13:15:00Z',
    updatedAt: '2024-01-21T13:15:00Z',
    isValid: true
  },
  {
    id: 'system-8',
    name: 'PATHEXT',
    value: '.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.PY;.PYW',
    type: 'system',
    remark: '可执行文件扩展名',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    isValid: true
  }
];

// 模拟Tauri invoke函数
export const mockInvoke = async (command: string, args?: any): Promise<any> => {
  console.log(`Mock invoke called: ${command}`, args);
  
  switch (command) {
    case 'get_environment_variables':
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockEnvironmentVariables;
      
    case 'create_environment_variable':
      await new Promise(resolve => setTimeout(resolve, 300));
      const newVar: EnvironmentVariable = {
        id: `new-${Date.now()}`,
        name: args.variable.name,
        value: args.variable.value,
        type: args.variable.varType,
        remark: args.variable.remark || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isValid: true
      };
      mockEnvironmentVariables.push(newVar);
      return newVar;
      
    case 'update_environment_variable':
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockEnvironmentVariables.findIndex(v => v.id === args.id);
      if (index !== -1) {
        mockEnvironmentVariables[index] = {
          ...mockEnvironmentVariables[index],
          name: args.variable.name,
          value: args.variable.value,
          type: args.variable.type,
          remark: args.variable.remark,
          updatedAt: new Date().toISOString()
        };
        return mockEnvironmentVariables[index];
      }
      throw new Error('Variable not found');
      
    case 'delete_environment_variable':
      await new Promise(resolve => setTimeout(resolve, 200));
      const deleteIndex = mockEnvironmentVariables.findIndex(v => v.id === args.id);
      if (deleteIndex !== -1) {
        mockEnvironmentVariables.splice(deleteIndex, 1);
        return true;
      }
      throw new Error('Variable not found');
      
    case 'validate_all_environment_variables':
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 随机标记一些变量为无效
      return mockEnvironmentVariables.map(v => ({
        ...v,
        isValid: !v.name.includes('INVALID')
      }));
      
    case 'search_environment_variables':
      await new Promise(resolve => setTimeout(resolve, 300));
      const { query, searchType } = args;
      return mockEnvironmentVariables.filter(v => {
        switch (searchType) {
          case 'name':
            return v.name.toLowerCase().includes(query.toLowerCase());
          case 'value':
            return v.value.toLowerCase().includes(query.toLowerCase());
          case 'remark':
            return v.remark?.toLowerCase().includes(query.toLowerCase()) || false;
          case 'all':
          default:
            return v.name.toLowerCase().includes(query.toLowerCase()) ||
                   v.value.toLowerCase().includes(query.toLowerCase()) ||
                   (v.remark?.toLowerCase().includes(query.toLowerCase()) || false);
        }
      });
      
    case 'export_environment_variables':
      await new Promise(resolve => setTimeout(resolve, 500));
      return JSON.stringify(mockEnvironmentVariables, null, 2);
      
    case 'import_environment_variables':
      await new Promise(resolve => setTimeout(resolve, 800));
      // 模拟导入成功
      return { success: true, imported: args.variables.length };
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

// 在开发环境中替换Tauri的invoke函数
if (typeof window !== 'undefined') {
  // 模拟Tauri环境
  window.__TAURI__ = {
    invoke: mockInvoke,
    event: {
      listen: async (event: string, handler: (event: any) => void) => {
        // 模拟事件监听，返回取消监听的函数
        return () => {};
      }
    }
  };
}