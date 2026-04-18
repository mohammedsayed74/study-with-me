const Mcq = require('../models/Mcq');

const createQuestion = async (req, res) => {
    try {
        const {
            courseCode,
            chapter,
            difficulty,
            questionText,
            options,
            correctAnswer,
            explanation
        } = req.body;

        const alreadyExists = await Mcq.findOne({ questionText, options, correctAnswer, courseCode, chapter, difficulty });

        if (alreadyExists) {
            return res.status(400).json({ message: "Question already exists" });
        }


        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "The correct answer must exactly match one of the provided options!"
            });
        }

        let finalChapter = chapter;
        if (typeof chapter === 'string') {
            const match = chapter.match(/\d+/);
            if (match) {
                finalChapter = Number(match[0]);
            } else {
                finalChapter = Number(chapter);
            }
        }

        const newQuestion = await Mcq.create({
            courseCode: courseCode.toUpperCase(),
            chapter: isNaN(finalChapter) ? 0 : finalChapter,
            difficulty,
            questionText,
            options,
            correctAnswer,
            explanation,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: newQuestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuizQuestions = async (req, res) => {
    try {
        const { courseCode, chapter, difficulty } = req.query;

        let query = {};
        if (courseCode) query.courseCode = courseCode.toUpperCase();
        
        if (chapter) {
            const chapterNum = Number(chapter);
            const chapterStr = String(chapter);
            
            query.$or = [
                { chapter: chapterNum },
                { chapter: chapterStr },
                { chapter: `Chapter ${chapterNum}` },
                { chapter: `Chapter ${chapterStr}` },
                { chapter: { $regex: `^${chapterStr}$`, $options: 'i' } }
            ];
            
            // If it's something like "chapter-1", try extracting the number too
            const match = chapterStr.match(/\d+/);
            if (match) {
                const extractedNum = Number(match[0]);
                query.$or.push({ chapter: extractedNum });
                query.$or.push({ chapter: String(extractedNum) });
                query.$or.push({ chapter: `Chapter ${extractedNum}` });
            }
        }
        
        if (difficulty) query.difficulty = difficulty;

        let questions;
        if (req.user && req.user.role === 'teacher') {
            questions = await Mcq.find(query).select('-__v');
        } else {
            const rawQuestions = await Mcq.find(query)
                .select('-correctAnswer -explanation -createdBy -__v');
            questions = rawQuestions.sort(() => 0.5 - Math.random());
        }

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyAnswer = async (req, res) => {
    try {
        const { questionId, selectedOption } = req.body;

        const question = await Mcq.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const isCorrect = question.correctAnswer === selectedOption;

        res.status(200).json({
            success: true,
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { options, correctAnswer } = req.body;

        if (options && correctAnswer && !options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "The correct answer must exactly match one of the provided options!"
            });
        }
        const updatedQuestion = await Mcq.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({ success: true, data: updatedQuestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedQuestion = await Mcq.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully',
            id: deletedQuestion._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuestion,
    getQuizQuestions,
    verifyAnswer,
    updateQuestion,
    deleteQuestion
};