import { execSync, spawn, ChildProcess } from 'child_process'
import http from 'http'

describe('Application Smoke Test', () => {
    const PORT = 3001
    let serverProcess: ChildProcess | null = null

    beforeAll(async () => {
        execSync('npm run lint', { stdio: 'inherit' })
        execSync('npm run build', { stdio: 'inherit' })

        serverProcess = spawn('npx', ['next', 'start', '-p', String(PORT)], {
            stdio: 'inherit',
            shell: true
        })

        await new Promise((resolve) => setTimeout(resolve, 8000))
    }, 300000)

    afterAll(() => {
        if (serverProcess) serverProcess.kill()
    })

    it('server responds on localhost:3001', async () => {
        const statusCode = await new Promise<number>((resolve, reject) => {
            http
                .get(`http://localhost:${PORT}`, (res) => {
                    resolve(res.statusCode ?? 0)
                })
                .on('error', reject)
        })

        expect(statusCode).toBe(200)
    }, 30000)
})