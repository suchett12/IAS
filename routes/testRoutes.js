const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const User = require('../models/User');
const TestResult = require('../models/TestResult');

// Admin: Create Test & Append Questions
router.get('/create', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.render('createTest');
    } else {
        res.redirect("/user/login")
    }
});

router.post('/create', async (req, res) => {
    const { name, description, type, questions } = req.body;

    if (req.session.user && req.session.user.role === 'admin') {
        try {
            // Format questions to include the 'type' field
            const formattedQuestions = questions.map(q => ({
                section: q.section,
                questionText: q.questionText,
                options: q.options.split(','), // Convert comma-separated options into an array
                correctAnswer: q.correctAnswer,
                type: q.type, // Include question type
            }));

            const newTest = new Test({
                name,
                description,
                type,
                questions: formattedQuestions,
                createdBy: req.session.user._id,
            });

            await newTest.save();
            res.redirect('/user/dashboard'); // Redirect to a dashboard or confirmation page
        } catch (err) {
            res.status(400).send('Error creating test');
        }
    } else {
        res.redirect("/user/login")
    }
});


router.get('/manage', async (req, res) => {
    try {
        const tests = await Test.find();  // Fetch all tests from MongoDB
        res.render('manageTests', { tests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Route to delete a test
router.post('/delete/:id', async (req, res) => {
    try {
        const testId = req.params.id;
        await Test.findByIdAndDelete(testId);  // Delete the test by ID
        res.redirect('/test/manage');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// Route to display available tests
router.get('/available', async (req, res) => {
    try {
        const tests = await Test.find();  // Fetch all available tests
        res.render('availableTests', { tests, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



// Route for taking a test with time tracking, difficulty, and section-based performance
router.get('/:id/take', async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);  // Find the test by ID
        const startTime = Date.now();  // Track the start time
        console.log(req.session.user)
        res.render('takeTest', {
            test,
            user: req.session.user,
            startTime
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/:id/submit', async (req, res) => {
    try {
        const { answers, timeSpent, switches, sectionPerformance, difficulty, timePerQuestion } = req.body;
        const test = await Test.findById(req.params.id);
        let score = 0;

        console.log(req.body); // Log the received data for debugging

        // Calculate score based on answers
        test.questions.forEach((question, index) => {
            if (question.correctAnswer === answers[index]) score++; // Increment score if the answer is correct
        });

        // Prepare the test result object
        const testResult = new TestResult({
            user: req.session.user._id, // User ID from session
            test: test._id, // Test ID
            answers, // Answers submitted by the user
            timeSpent, // Total time spent on the test
            switches, // Number of times the user changed their answer
            score, // Calculated score
            sectionPerformance, // Performance data by sections
            difficulty, // Difficulty levels selected by the user for each question
            timePerQuestion, // Time spent on each question
        });

        // Save the result in the database
        await testResult.save();

        // Redirect to the results page
        res.redirect(`/test/${test._id}/results`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error'); // Send error message if something goes wrong
    }
});


router.post('/:id/submit', async (req, res) => {
    const { answers, timeSpent, switches } = req.body;
    const test = await Test.findById(req.params.id);
    let score = 0;

    // Calculate score
    test.questions.forEach((question, index) => {
        if (question.correctAnswer === answers[index]) score++;
    });

    // Save the result
    const testResult = new TestResult({
        user: req.session.user._id,
        test: test._id,
        answers,
        timeSpent,
        switches,
        score
    });

    await testResult.save();
    res.redirect(`/test/${test._id}/results`);
});


// Test Results for All Tests
router.get('/results', async (req, res) => {
    try {
        // Fetch all test results for the logged-in user and populate the related test details
        const results = await TestResult.find({ user: req.session.user._id })
            .populate('test') // Populate the 'test' field with the associated Test document
            .exec();

        // Check if results are found
        if (results.length === 0) {
            return res.render('testResults', { message: 'No test results available.' });
        }

        // Format the results to extract relevant details
        const formattedResults = results.map(result => ({
            testName: result.test.name,          // Access the 'name' from the populated 'test' object
            testDescription: result.test.description, // Access the 'description' from the populated 'test' object
            score: result.score,
            dateTaken: result.dateTaken || new Date(),  // Use the current date if not present
        }));
        console.log(formattedResults)
        // Render the results page with the formatted data
        res.render('testResults', {
            results: formattedResults, message: 'All OK',
        });
    } catch (err) {
        console.error("Error fetching test results:", err);
        res.status(500).send('Error fetching test results');
    }
});





module.exports = router;
