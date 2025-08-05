import { 
  users, candidates, jobs, applications,
  type User, type InsertUser,
  type Candidate, type InsertCandidate,
  type Job, type InsertJob,
  type Application, type InsertApplication,
  type CandidateWithApplication
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  
  // Candidate methods
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  
  // Application methods
  getApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined>;
  getCandidatesWithApplications(): Promise<CandidateWithApplication[]>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async updateJob(id: string, updateJob: Partial<InsertJob>): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set(updateJob)
      .where(eq(jobs.id, id))
      .returning();
    return job || undefined;
  }

  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(insertCandidate)
      .returning();
    return candidate;
  }

  async updateCandidate(id: string, updateCandidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [candidate] = await db
      .update(candidates)
      .set(updateCandidate)
      .where(eq(candidates.id, id))
      .returning();
    return candidate || undefined;
  }

  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values({
        ...insertApplication,
        strengths: insertApplication.strengths as string[] | null,
        weaknesses: insertApplication.weaknesses as string[] | null,
        interviewQuestions: insertApplication.interviewQuestions as string[] | null,
      })
      .returning();
    return application;
  }

  async updateApplication(id: string, updateApplication: Partial<InsertApplication>): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({
        ...updateApplication,
        strengths: updateApplication.strengths as string[] | null | undefined,
        weaknesses: updateApplication.weaknesses as string[] | null | undefined,
        interviewQuestions: updateApplication.interviewQuestions as string[] | null | undefined,
      })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  async getCandidatesWithApplications(): Promise<CandidateWithApplication[]> {
    const results = await db
      .select({
        candidate: candidates,
        application: applications,
        job: jobs,
      })
      .from(candidates)
      .leftJoin(applications, eq(candidates.id, applications.candidateId))
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .orderBy(desc(candidates.createdAt));

    return results.map(row => ({
      ...row.candidate,
      application: {
        ...row.application!,
        job: row.job!,
      },
    }));
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.createdAt));
  }
}

export const storage = new DatabaseStorage();
