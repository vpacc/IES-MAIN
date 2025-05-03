import express from 'express'
import { addCourse, deleteCourse, educatorDashboardData, getCourseDetails, getEducatorCourses, getEnrolledStudentsData, updateCourse, updateRoleToEducator, addCourseTest, updateCourseTest } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Educators
 *   description: Educator management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NewCourse:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           description: Course title
 *         description:
 *           type: string
 *           description: Course description
 *         price:
 *           type: number
 *           description: Course price
 *         image:
 *           type: string
 *           format: binary
 *           description: Course thumbnail image
 *     DashboardData:
 *       type: object
 *       properties:
 *         totalCourses:
 *           type: number
 *           description: Total number of courses created by educator
 *         totalStudents:
 *           type: number
 *           description: Total number of students enrolled
 *         totalRevenue:
 *           type: number
 *           description: Total revenue generated from courses
 */

const educatorRouter = express.Router()

/**
 * @swagger
 * /api/educator/update-role:
 *   get:
 *     summary: Update user role to educator
 *     tags: [Educators]
 *     description: Updates the current user's role to become an educator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
// Add Educator Role 
educatorRouter.get('/update-role', updateRoleToEducator)

/**
 * @swagger
 * /api/educator/add-course:
 *   post:
 *     summary: Add a new course
 *     tags: [Educators]
 *     description: Allows an educator to create a new course
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseData
 *               - image
 *             properties:
 *               courseData:
 *                 type: string
 *                 description: JSON string containing course information (courseTitle, courseDescription, coursePrice, discount, courseContent)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Course thumbnail image
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 courseId:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - User not authenticated or not an educator
 *       500:
 *         description: Server error
 */
// Add Courses 
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)

/**
 * @swagger
 * /api/educator/add-course-test:
 *   post:
 *     summary: Add a new course (Test API without auth)
 *     tags: [Educators]
 *     description: Test API to add a course without authentication
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseData
 *               - image
 *               - educatorId
 *             properties:
 *               courseData:
 *                 type: string
 *                 description: |
 *                   JSON string containing course information. Example:
 *                   ```json
 *                   {
 *                     "courseTitle": "JavaScript Basics",
 *                     "courseDescription": "Learn the fundamentals of JavaScript programming",
 *                     "coursePrice": 99.99,
 *                     "discount": 20,
 *                     "courseContent": [
 *                       {
 *                         "chapterId": "chap1",
 *                         "chapterOrder": 1,
 *                         "chapterTitle": "Introduction",
 *                         "chapterContent": [
 *                           {
 *                             "lectureId": "lec1",
 *                             "lectureTitle": "Getting Started",
 *                             "lectureDuration": 15,
 *                             "lectureUrl": "https://example.com/video1",
 *                             "isPreviewFree": true,
 *                             "lectureOrder": 1
 *                           }
 *                         ]
 *                       }
 *                     ]
 *                   }
 *                   ```
 *               educatorId:
 *                 type: string
 *                 description: ID of the educator creating the course (any valid string)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Course thumbnail image
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Bad request - Invalid input
 *       500:
 *         description: Server error
 */
// Add Course Test (No Auth)
educatorRouter.post('/add-course-test', upload.single('image'), addCourseTest)

/**
 * @swagger
 * /api/educator/courses/{courseId}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Educators]
 *     description: Allows an educator to delete their course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to delete
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - User not authenticated or not an educator
 *       403:
 *         description: Forbidden - User not authorized to delete this course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
// Delete Course
educatorRouter.delete('/courses/:courseId', protectEducator, deleteCourse); 

/**
 * @swagger
 * /api/educator/courses/{courseId}:
 *   patch:
 *     summary: Update a course
 *     tags: [Educators]
 *     description: Allows an educator to update their course details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized - User not authenticated or not an educator
 *       403:
 *         description: Forbidden - User not authorized to update this course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
// Update Course
educatorRouter.patch('/courses/:courseId', upload.single('image'), protectEducator, updateCourse);

/**
 * @swagger
 * /api/educator/update-course-test/{courseId}:
 *   patch:
 *     summary: Update a course (Test API without auth)
 *     tags: [Educators]
 *     description: Test API to update a course without authentication
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course to update
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseData
 *               - educatorId
 *             properties:
 *               courseData:
 *                 type: string
 *                 description: |
 *                   JSON string containing course information to update. Example:
 *                   ```json
 *                   {
 *                     "courseTitle": "Updated JavaScript Basics",
 *                     "courseDescription": "Updated course description",
 *                     "coursePrice": 89.99,
 *                     "discount": 15
 *                   }
 *                   ```
 *               educatorId:
 *                 type: string
 *                 description: ID of the educator who owns the course
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New course thumbnail image (optional)
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Bad request - Invalid input
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
// Update Course Test (No Auth)
educatorRouter.patch('/update-course-test/:courseId', upload.single('image'), updateCourseTest);

/**
 * @swagger
 * /api/educator/courses/{courseId}:
 *   get:
 *     summary: Get course details
 *     tags: [Educators]
 *     description: Get detailed information about a specific course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized - User not authenticated or not an educator
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
// Get Course Details
educatorRouter.get('/courses/:courseId', protectEducator, getCourseDetails);

/**
 * @swagger
 * /api/educator/courses:
 *   get:
 *     summary: Get all educator courses
 *     tags: [Educators]
 *     description: Retrieves all courses created by the logged-in educator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Educator courses retrieved successfully
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
 *         description: Unauthorized - User not authenticated or not an educator
 *       500:
 *         description: Server error
 */
// Get Educator Courses 
educatorRouter.get('/courses', protectEducator, getEducatorCourses)

/**
 * @swagger
 * /api/educator/dashboard:
 *   get:
 *     summary: Get educator dashboard data
 *     tags: [Educators]
 *     description: Retrieves dashboard statistics for the educator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardData'
 *       401:
 *         description: Unauthorized - User not authenticated or not an educator
 *       500:
 *         description: Server error
 */
// Get Educator Dashboard Data
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)

/**
 * @swagger
 * /api/educator/enrolled-students:
 *   get:
 *     summary: Get enrolled students data
 *     tags: [Educators]
 *     description: Retrieves data about students enrolled in the educator's courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 students:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       enrolledCourses:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized - User not authenticated or not an educator
 *       500:
 *         description: Server error
 */
// Get Educator Students Data
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)



export default educatorRouter;