import express from 'express'
import { getAllCourse, getCourseId } from '../controllers/courseController.js';

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the course
 *         title:
 *           type: string
 *           description: Course title
 *         description:
 *           type: string
 *           description: Course description
 *         instructor:
 *           type: string
 *           description: ID of the course instructor
 *         price:
 *           type: number
 *           description: Course price
 *         thumbnail:
 *           type: string
 *           description: URL of the course thumbnail
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Course creation timestamp
 *       example:
 *         _id: "60d21b4967d0d8992e610c85"
 *         title: "Introduction to JavaScript"
 *         description: "Learn the fundamentals of JavaScript programming"
 *         instructor: "60d21b4967d0d8992e610c80"
 *         price: 29.99
 *         thumbnail: "https://example.com/images/javascript-course.jpg"
 *         createdAt: "2023-01-20T13:45:30Z"
 */

const courseRouter = express.Router()

/**
 * @swagger
 * /api/course/all:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     description: Retrieve a list of all available courses
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 */
// Get All Course
courseRouter.get('/all', getAllCourse)

/**
 * @swagger
 * /api/course/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     description: Retrieve a single course by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
// Get Course Data By Id
courseRouter.get('/:id', getCourseId)


export default courseRouter;