import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../controllers/userController.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           description: User's email address
 *         role:
 *           type: string
 *           description: User role (student, educator, admin)
 *         enrolledCourses:
 *           type: array
 *           items:
 *             type: string
 *           description: List of course IDs the user is enrolled in
 *     CourseProgress:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID
 *         courseId:
 *           type: string
 *           description: Course ID
 *         progress:
 *           type: number
 *           description: Progress percentage (0-100)
 *         completedLessons:
 *           type: array
 *           items:
 *             type: string
 *           description: List of completed lesson IDs
 */

const userRouter = express.Router()

/**
 * @swagger
 * /api/user/data:
 *   get:
 *     summary: Get user data
 *     tags: [Users]
 *     description: Retrieves the current user's profile data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
// Get user Data
userRouter.get('/data', getUserData)

/**
 * @swagger
 * /api/user/purchase:
 *   post:
 *     summary: Purchase a course
 *     tags: [Users]
 *     description: Allows a user to purchase and enroll in a course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course to purchase
 *     responses:
 *       200:
 *         description: Course purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid course ID or already purchased
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
userRouter.post('/purchase', purchaseCourse)

/**
 * @swagger
 * /api/user/enrolled-courses:
 *   get:
 *     summary: Get user enrolled courses
 *     tags: [Users]
 *     description: Retrieves all courses the user is enrolled in
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrolled courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
userRouter.get('/enrolled-courses', userEnrolledCourses)

/**
 * @swagger
 * /api/user/update-course-progress:
 *   post:
 *     summary: Update course progress
 *     tags: [Users]
 *     description: Update a user's progress in a specific course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - progress
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course
 *               progress:
 *                 type: number
 *                 description: Progress percentage (0-100)
 *               completedLessons:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs of completed lessons
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
userRouter.post('/update-course-progress', updateUserCourseProgress)

/**
 * @swagger
 * /api/user/get-course-progress:
 *   post:
 *     summary: Get course progress
 *     tags: [Users]
 *     description: Get a user's progress for a specific course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course
 *     responses:
 *       200:
 *         description: Course progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseProgress'
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
userRouter.post('/get-course-progress', getUserCourseProgress)

/**
 * @swagger
 * /api/user/add-rating:
 *   post:
 *     summary: Add course rating
 *     tags: [Users]
 *     description: Allow a user to rate a course they're enrolled in
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - rating
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ID of the course
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value (1-5)
 *               review:
 *                 type: string
 *                 description: Optional review text
 *     responses:
 *       200:
 *         description: Rating added successfully
 *       400:
 *         description: Bad request - Invalid input or not enrolled
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
userRouter.post('/add-rating', addUserRating)

export default userRouter;