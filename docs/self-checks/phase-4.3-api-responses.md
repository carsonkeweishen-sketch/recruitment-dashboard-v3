=== Phase 4.3 API Responses ===

### GET /api/candidates
```json
{
    "success": true,
    "data": [
        {
            "id": "cmqt44zf9000izyqh4k6k7yb6",
            "name": "\u6797\u53ef",
            "source": "BOSS\u76f4\u8058",
            "currentCompany": "\u5b9d\u6d01\u4e2d\u56fd",
            "currentTitle": "KA\u7ecf\u7406",
            "tags": [
                "\u5feb\u6d88",
                "KA",
                "\u540d\u521b"
            ],
            "resumeSummary": "5\u5e74\u5feb\u6d88KA\u7ecf\u9a8c\uff0c\u8d1f\u8d23\u534e\u5357\u533a\u540d\u521b/\u4e09\u798f\u6e20\u9053\uff0c\u5e74\u9500\u552e\u989d3000\u4e07+\u3002",
            "applicationCount": 1,
            "activeApplicationCount": 1,
            "latestApplicationStage": "business_screen",
            "latestJobTitle": "KA\u5927\u5ba2\u6237\u9500\u552e",
            "latestActivityAt": "2026-06-25T06:20:20.988Z",
            "createdAt": "2026-06-25T06:20:20.954Z",
            "updatedAt": "2026-06-25T06:20:20.954Z"
        },
        {
            "id": "cmqt44zfa000jzyqh68zqeo2q",
            "name": "\u5468\u4ea6\u7136",
            "source": "\u730e\u5934\u63a8\u8350",
            "currentCompany": "\u6b27\u83b1\u96c5",
            "currentTitle": "\u91c7\u8d2d\u4e3b\u7ba1",
            "tags": [
                "\u65e5\u5316",
                "\u91c7\u8d2d",
                "\u4f9b\u5e94\u94fe"
            ],
            "resumeSummary": "3\u5e74\u65e5\u5316\u91c7\u8d2d\u7ecf\u9a8c\uff0c\u7ba1\u740620+\u4f9b\u5e94\u5546\uff0c\u5e74\u5ea6\u91c7\u8d2d\u989d5000\u4e07+\u3002",
            "applicationCount": 1,
            "activeApplicationCount": 1,
            "latestApplicationStage": "hr_screen",
            "latestJobTitle": "\u91c7\u8d2d\u8d44\u6e90\u5f00\u53d1",
            "latestActivityAt": "2026-06-25T06:20:20.988Z",
            "createdAt": "2026-06-25T06:20:20.954Z",
            "updatedAt": "2026-06-25T06:20:20.954Z"
        },
        {
            "id": "cmqt44zfb000kzyqhhevphgrl",
            "name": "\u9648\u4e66\u598d",
            "source": "\u62c9\u52fe\u7f51",
            "currentCompany": "\u5b57\u8282\u8df3\u52a8",
            "currentTitle": "\u5a92\u4ecb\u7ecf\u7406",
            "tags": [
                "\u5a92\u4ecb",
                "\u6296\u97f3",
                "\u6295\u653e"
            ],
            "resumeSummary": "4\u5e74\u5a92\u4ecb\u6295\u653e\u7ecf\u9a8c\uff0c\u6296\u97f3/\u5c0f\u7ea2\u4e66\u53cc\u5e73\u53f0\uff0c\u6708\u6295\u653e\u9884\u7b97500\u4e07+\u3002",
            "applicationCount": 1,
            "activeApplicationCount": 1,
            "latestApplicationStage": "first_interview",
            "latestJobTitle": "\u5a92\u4ecb\u6295\u653e",
            "latestActivityAt": "2026-06-25T06:20:20.988Z",
            "createdAt": "2026-06-25T06:20:20.954Z",
            "updatedAt": "2026-06-25T06:20:20.954Z"
        },
        {
            "id": "cmqt44zfb000lzyqhuxi9w0vl",
            "name": "\u8bb8\u5b89\u7136",
            "source": "BOSS\u76f4\u8058",
            "currentCompany": "\u65e0\u5fe7\u4f20\u5a92",
            "currentTitle": "\u76f4\u64ad\u8fd0\u8425",
            "tags": [
                "\u76f4\u64ad",
                "\u573a\u63a7",
                "\u7f8e\u5986"
            ],
            "resumeSummary": "2\u5e74\u76f4\u64ad\u573a\u63a7\u7ecf\u9a8c\uff0c\u5355\u573aGMV\u6700\u9ad850\u4e07+\uff0c\u719f\u6089\u7f8e\u5986\u76f4\u64ad\u8282\u594f\u3002",
            "applicationCount": 1,
            "activeApplicationCount": 1,
            "latestApplicationStage": "sourced",
            "latestJobTitle": "\u76f4\u64ad\u573a\u63a7",
            "latestActivityAt": "2026-06-25T06:20:20.988Z",
```

### GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6
```json
{
    "success": true,
    "data": {
        "id": "cmqt44zf9000izyqh4k6k7yb6",
        "name": "\u6797\u53ef",
        "source": "BOSS\u76f4\u8058",
        "currentCompany": "\u5b9d\u6d01\u4e2d\u56fd",
        "currentTitle": "KA\u7ecf\u7406",
        "tags": [
            "\u5feb\u6d88",
            "KA",
            "\u540d\u521b"
        ],
        "resumeSummary": "5\u5e74\u5feb\u6d88KA\u7ecf\u9a8c\uff0c\u8d1f\u8d23\u534e\u5357\u533a\u540d\u521b/\u4e09\u798f\u6e20\u9053\uff0c\u5e74\u9500\u552e\u989d3000\u4e07+\u3002",
        "email": "lin.ke@example.com",
        "phone": "13800000001",
        "applicationCount": 1,
        "activeApplicationCount": 1,
        "applications": [
            {
                "id": "cmqt44zg9000qzyqhb4gz4lbz",
                "job": {
                    "id": "cmqt44ze2000azyqhghevqv4e",
                    "title": "KA\u5927\u5ba2\u6237\u9500\u552e",
                    "jobCode": "SALES-001",
                    "department": "\u9500\u552e/KA\u6e20\u9053",
                    "level": "S4"
                },
                "stage": "business_screen",
                "status": "active",
                "source": "BOSS\u76f4\u8058",
                "fitScore": 85,
                "owner": {
                    "id": "cmqt44zcq0007zyqhn7dsk3ir",
                    "name": "\u738b\u62db\u8058"
                },
                "lastActivityAt": "2026-06-25T06:20:20.988Z",
                "createdAt": "2026-06-25T06:20:20.988Z"
            }
        ],
        "createdAt": "2026-06-25T06:20:20.954Z",
        "updatedAt": "2026-06-25T06:20:20.954Z"
    }
}
```

### GET /api/applications
```json
{
    "success": true,
    "data": [
        {
            "id": "cmqt44zg9000qzyqhb4gz4lbz",
            "candidate": {
                "id": "cmqt44zf9000izyqh4k6k7yb6",
                "name": "\u6797\u53ef",
                "currentCompany": "\u5b9d\u6d01\u4e2d\u56fd",
                "currentTitle": "KA\u7ecf\u7406"
            },
            "job": {
                "id": "cmqt44ze2000azyqhghevqv4e",
                "title": "KA\u5927\u5ba2\u6237\u9500\u552e",
                "jobCode": "SALES-001",
                "department": "\u9500\u552e/KA\u6e20\u9053"
            },
            "stage": "business_screen",
            "status": "active",
            "source": "BOSS\u76f4\u8058",
            "fitScore": 85,
            "owner": {
                "id": "cmqt44zcq0007zyqhn7dsk3ir",
                "name": "\u738b\u62db\u8058"
            },
            "lastActivityAt": "2026-06-25T06:20:20.988Z",
            "createdAt": "2026-06-25T06:20:20.988Z"
        },
        {
            "id": "cmqt44zg9000rzyqhqvdjwprr",
            "candidate": {
                "id": "cmqt44zfa000jzyqh68zqeo2q",
                "name": "\u5468\u4ea6\u7136",
                "currentCompany": "\u6b27\u83b1\u96c5",
                "currentTitle": "\u91c7\u8d2d\u4e3b\u7ba1"
            },
            "job": {
                "id": "cmqt44ze2000bzyqh2892s9ug",
                "title": "\u91c7\u8d2d\u8d44\u6e90\u5f00\u53d1",
                "jobCode": "SCM-001",
                "department": "\u4f9b\u5e94\u94fe/\u91c7\u8d2d\u90e8"
            },
            "stage": "hr_screen",
            "status": "active",
            "source": "\u730e\u5934\u63a8\u8350",
            "fitScore": 78,
            "owner": {
                "id": "cmqt44zcq0007zyqhn7dsk3ir",
                "name": "\u738b\u62db\u8058"
            },
            "lastActivityAt": "2026-06-25T06:20:20.988Z",
            "createdAt": "2026-06-25T06:20:20.988Z"
        },
        {
            "id": "cmqt44zga000szyqhddb8u1is",
            "candidate": {
                "id": "cmqt44zfb000kzyqhhevphgrl",
                "name": "\u9648\u4e66\u598d",
                "currentCompany": "\u5b57\u8282\u8df3\u52a8",
                "currentTitle": "\u5a92\u4ecb\u7ecf\u7406"
```

### GET /api/applications/cmqt44zg9000qzyqhb4gz4lbz
```json
{
    "success": true,
    "data": {
        "id": "cmqt44zg9000qzyqhb4gz4lbz",
        "candidate": {
            "id": "cmqt44zf9000izyqh4k6k7yb6",
            "name": "\u6797\u53ef",
            "currentCompany": "\u5b9d\u6d01\u4e2d\u56fd",
            "currentTitle": "KA\u7ecf\u7406",
            "source": "BOSS\u76f4\u8058",
            "tags": [
                "\u5feb\u6d88",
                "KA",
                "\u540d\u521b"
            ]
        },
        "job": {
            "id": "cmqt44ze2000azyqhghevqv4e",
            "title": "KA\u5927\u5ba2\u6237\u9500\u552e",
            "jobCode": "SALES-001",
            "department": "\u9500\u552e/KA\u6e20\u9053",
            "level": "S4"
        },
        "stage": "business_screen",
        "status": "active",
        "source": "BOSS\u76f4\u8058",
        "fitScore": 85,
        "owner": {
            "id": "cmqt44zcq0007zyqhn7dsk3ir",
            "name": "\u738b\u62db\u8058"
        },
        "createdAt": "2026-06-25T06:20:20.988Z",
        "updatedAt": "2026-06-25T06:20:20.988Z"
    }
}
```
