# Phase 8.15C Demo Access

## Demo URL
```
http://localhost:3000
```

## 启动目录
```
/workspace/recruitment-dashboard
```

## 启动命令
```bash
export PATH=/root/.nvm/versions/node/v22.13.1/bin:$PATH
cd /workspace/recruitment-dashboard
NODE_OPTIONS="" npx next dev -p 3000
```

## 启动分支
```
agent/workbuddy/phase-7
```

## 启动 commit
```
4d6d57f — workbuddy phase-8.15b: demo recording and action detail hotfix
```

## 是否清理 .next
```
yes — rm -rf .next 后重新 build
```

## 是否关闭旧进程
```
yes — pkill -9 -f "next dev" && pkill -9 -f "next-server"
```

## 是否重新 build
```
yes — npx next build (BUILD_ID: nl8Gp1pWFNYeZdXtJHACx)
```

## 登录账号
admin（开发模式，无登录系统）

## 登录角色
admin（全权限）

## Runtime Proof
页面右下角显示 Demo Runtime Proof badge：
- Branch: agent/workbuddy/phase-7
- Commit: 4d6d57f
- Phase: 8.15C
- Build Time: 2026-06-29 06:14 UTC
- Data Version: liran-real-jd-v1

## 实际访问截图
见 `screenshots/phase-8.15c/` 目录（8 张 Runtime 对齐截图）
