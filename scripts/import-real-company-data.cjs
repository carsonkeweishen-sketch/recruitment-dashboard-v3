// Phase 8.12B: Import real company data via Prisma
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const XLSX = require('xlsx');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function importJD() {
    const wb = XLSX.readFile('/root/uploads/1782366823639658589-理然JD库.xlsx');
    const ws = wb.Sheets['Sheet1'];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    let imported = 0;
    for (let i = 1; i < rows.length; i++) {
        const [seq, dept, title, level, jdText, sourceId] = rows[i];
        if (!title) continue;
        
        const deptName = String(dept || '未分类').trim();
        const deptCode = deptName.replace(/[^A-Za-z]/g, '').substring(0, 10).toUpperCase() || 'OTHER';
        const jobCode = `RL-${deptCode}-${seq}`;
        const jobTitle = String(title).trim();
        const jd = String(jdText || '').trim();
        const levelStr = String(level || 'S2').trim();
        
        try {
            await prisma.job.create({
                data: {
                    jobCode,
                    title: jobTitle,
                    level: levelStr,
                    status: 'open',
                    priority: 'medium',
                    headcount: 1,
                    jdText: jd,
                    profileSummary: jd.substring(0, 500),
                    department: {
                        connectOrCreate: {
                            where: { code: deptCode },
                            create: { name: deptName, code: deptCode }
                        }
                    },
                    owner: { connect: { email: 'chen.zong@example.com' } }
                }
            });
            imported++;
        } catch(e) {
            if (e.code === 'P2002') {
                // Duplicate, skip
            } else if (imported === 0) {
                console.log(`  First error: ${e.message.substring(0, 200)}`);
            }
        }
        
        if (imported > 0 && imported % 20 === 0) {
            console.log(`  Imported ${imported} jobs...`);
        }
    }
    console.log(`✅ Imported ${imported} real jobs from 理然JD库.xlsx`);
    return imported;
}

async function cleanupFake() {
    // Delete fake candidates
    const fakeNames = ['候选人A', '候选人B', '候选人C', 'Demo Candidate', 'Sample Candidate'];
    for (const name of fakeNames) {
        const c = await prisma.candidate.findFirst({ where: { name } });
        if (c) {
            await prisma.actionItem.deleteMany({ where: { candidateId: c.id } });
            await prisma.application.deleteMany({ where: { candidateId: c.id } });
            await prisma.candidate.delete({ where: { id: c.id } });
        }
    }
    
    // Delete demo users
    for (const name of ['王招聘', '赵业务', '孙面试官']) {
        await prisma.activityLog.deleteMany({ where: { actor: { name } } });
        await prisma.user.deleteMany({ where: { name } });
    }
    
    console.log('✅ Fake data cleaned');
}

async function main() {
    console.log('='.repeat(60));
    console.log('Phase 8.12B: Real Company Data Import (Prisma)');
    console.log('='.repeat(60));
    
    await cleanupFake();
    await importJD();
    
    const count = await prisma.job.count();
    console.log(`\nTotal jobs in DB: ${count}`);
    
    await prisma.$disconnect();
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
