import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Modal,
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    InputLabel,
    FormHelperText
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function EnrollmentFormModal({ open, handleClose, mode, enrollment, onFormSubmit }) {
    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
        watch,
    } = useForm({
        defaultValues: {
            courseId: '',
            userId: '',
            description: '',
            paymentAmount: '',
            discount: '',
            paymentDate: dayjs(),
            enrollmentStatus: 0,
            paymentStatus: 0,
        },
    });

    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    const paymentAmount = watch('paymentAmount');
    const discount = watch('discount');

    const fetchCoursesAndUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found.');
            }

            const coursesResponse = await fetch('https://apibeta.fellow.one/api/Courses', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const usersResponse = await fetch('https://apibeta.fellow.one/api/Users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!coursesResponse.ok) {
                throw new Error(`Failed to fetch courses: HTTP status ${coursesResponse.status}`);
            }
            if (!usersResponse.ok) {
                throw new Error(`Failed to fetch users: HTTP status ${usersResponse.status}`);
            }

            const coursesData = await coursesResponse.json();
            const usersData = await usersResponse.json();

            setCourses(coursesData);
            setUsers(usersData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setApiError('Failed to load required data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoursesAndUsers();
    }, []);

    useEffect(() => {
        if (mode === 'edit' && enrollment) {
            reset({
                courseId: enrollment.courseId,
                userId: enrollment.userId,
                description: enrollment.description || '',
                paymentAmount: enrollment.paymentAmount,
                discount: enrollment.discount,
                paymentTotal: enrollment.paymentTotal,
                paymentDate: dayjs(enrollment.paymentDate),
                enrollmentStatus: enrollment.enrollmentStatus,
                paymentStatus: enrollment.paymentStatus,
            });
        } else if (mode === 'create') {
            reset({
                courseId: '',
                userId: '',
                description: '',
                paymentAmount: '',
                discount: '',
                paymentTotal: '',
                paymentDate: dayjs(),
                enrollmentStatus: 0,
                paymentStatus: 0,
            });
        }
    }, [mode, enrollment, reset]);

    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found.');
            }

            const paymentTotal = (parseFloat(data.paymentAmount) || 0) - (parseFloat(data.discount) || 0);

            const enrollmentData = {
                courseId: parseInt(data.courseId, 10),
                userId: parseInt(data.userId, 10),
                description: data.description || '',
                paymentAmount: parseFloat(data.paymentAmount),
                discount: parseFloat(data.discount) || 0,
                paymentTotal: paymentTotal,
                paymentDate: data.paymentDate.toISOString(),
                enrollmentStatus: data.enrollmentStatus,
                paymentStatus: data.paymentStatus,
            };

            let response;
            const isEdit = mode === 'edit' && enrollment?.id;
            const url = isEdit
                ? `https://apibeta.fellow.one/api/Enrollments/${enrollment.id}`
                : 'https://apibeta.fellow.one/api/Enrollments';

            if (isEdit) {
                response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...enrollmentData, id: enrollment.id }),
                });
            } else {
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(enrollmentData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${mode} enrollment.`);
            }

            onFormSubmit();
            handleClose();

        } catch (err) {
            console.error('API Error:', err);
            alert(err.message || 'An unexpected error occurred.');
        }
    };

    if (loading) {
        return (
            <Modal open={open} onClose={handleClose}>
                <Box sx={{ ...style, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography mt={2}>Loading data...</Typography>
                </Box>
            </Modal>
        );
    }

    if (apiError) {
        return (
            <Modal open={open} onClose={handleClose}>
                <Box sx={{ ...style, textAlign: 'center' }}>
                    <Typography color="error">{apiError}</Typography>
                    <Button onClick={handleClose} sx={{ mt: 2 }}>Close</Button>
                </Box>
            </Modal>
        );
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" component="h2" mb={2}>
                    {mode === 'create' ? 'Add New Enrollment' : 'Edit Enrollment'}
                </Typography>

                <Controller
                    name="courseId"
                    control={control}
                    rules={{ required: 'Course is required' }}
                    render={({ field }) => (
                        <FormControl fullWidth margin="normal" required error={!!errors.courseId}>
                            <InputLabel id="course-label">Course</InputLabel>
                            <Select {...field} labelId="course-label" label="Course">
                                {courses.map((course) => (
                                    <MenuItem key={course.id} value={course.id}>
                                        {course.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.courseId && <FormHelperText>{errors.courseId.message}</FormHelperText>}
                        </FormControl>
                    )}
                />

                <Controller
                    name="userId"
                    control={control}
                    rules={{ required: 'User is required' }}
                    render={({ field }) => (
                        <FormControl fullWidth margin="normal" required error={!!errors.userId}>
                            <InputLabel id="user-label">User</InputLabel>
                            <Select {...field} labelId="user-label" label="User">
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.fullName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.userId && <FormHelperText>{errors.userId.message}</FormHelperText>}
                        </FormControl>
                    )}
                />

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Description"
                            fullWidth
                            margin="normal"
                            multiline
                            rows={2}
                        />
                    )}
                />

                <Controller
                    name="paymentAmount"
                    control={control}
                    rules={{ required: 'Payment amount is required' }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Payment Amount"
                            type="number"
                            fullWidth
                            margin="normal"
                            error={!!errors.paymentAmount}
                            helperText={errors.paymentAmount?.message}
                        />
                    )}
                />

                <Controller
                    name="discount"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Discount"
                            type="number"
                            fullWidth
                            margin="normal"
                            error={!!errors.discount}
                            helperText={errors.discount?.message}
                        />
                    )}
                />

                <TextField
                    label="Total Payment"
                    value={(parseFloat(paymentAmount) || 0) - (parseFloat(discount) || 0)}
                    fullWidth
                    margin="normal"
                    disabled
                />
                
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                        name="paymentDate"
                        control={control}
                        rules={{ required: 'Payment date is required' }}
                        render={({ field }) => (
                            <DatePicker
                                {...field}
                                label="Payment Date"
                                value={field.value}
                                onChange={(date) => field.onChange(date)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.paymentDate}
                                        helperText={errors.paymentDate?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </LocalizationProvider>

                <Controller
                    name="enrollmentStatus"
                    control={control}
                    rules={{ required: 'Enrollment status is required' }}
                    render={({ field }) => (
                        <FormControl fullWidth margin="normal" required error={!!errors.enrollmentStatus}>
                            <InputLabel id="enrollment-status-label">Enrollment Status</InputLabel>
                            <Select {...field} labelId="enrollment-status-label" label="Enrollment Status">
                                <MenuItem value={0}>Pending</MenuItem>
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={2}>Completed</MenuItem>
                            </Select>
                            {errors.enrollmentStatus && <FormHelperText>{errors.enrollmentStatus.message}</FormHelperText>}
                        </FormControl>
                    )}
                />

                <Controller
                    name="paymentStatus"
                    control={control}
                    rules={{ required: 'Payment status is required' }}
                    render={({ field }) => (
                        <FormControl fullWidth margin="normal" required error={!!errors.paymentStatus}>
                            <InputLabel id="payment-status-label">Payment Status</InputLabel>
                            <Select {...field} labelId="payment-status-label" label="Payment Status">
                                <MenuItem value={0}>Pending</MenuItem>
                                <MenuItem value={10}>Failed</MenuItem>
                                <MenuItem value={20}>Refunded</MenuItem>
                                <MenuItem value={30}>Canceled</MenuItem>
                                <MenuItem value={40}>Completed</MenuItem>
                                <MenuItem value={50}>Partially Paid</MenuItem>
                            </Select>
                            {errors.paymentStatus && <FormHelperText>{errors.paymentStatus.message}</FormHelperText>}
                        </FormControl>
                    )}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button onClick={handleClose} variant="outlined" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : (mode === 'create' ? 'Create' : 'Save Changes')}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}