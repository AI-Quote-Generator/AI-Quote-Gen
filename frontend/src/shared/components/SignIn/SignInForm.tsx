import {Button, Col, Form, Row} from "react-bootstrap";
import * as Yup from "yup";
import {Formik, FormikHelpers, FormikProps} from "formik";
import jwtDecode from "jwt-decode";
import {AppDispatch, useAppDispatch} from "../../../store/store";
import {ClientResponseForSignIn, usePostSignInMutation} from "../../../store/apis";
import {DisplayStatus} from "../display-status/DisplayStatus";
import {FormDebugger} from "../FormDebugger";
import {string} from "yup";
import {getAuth, JwtToken} from "../../../store/auth";
import {SignIn} from "../../interfaces/Profile.ts";
export function SignInForm() {


const [ submitRequest ] = usePostSignInMutation()
    const dispatch: AppDispatch = useAppDispatch()

const validator = Yup.object().shape({
    profileEmail: Yup.string()
        .email("Please provide a valid email")
        .required("Email is required"),
    profilePassword: string()
        .required("A password is required to sign up")
        .min(8, "Password  cannot be under 8 characters"),
})

const signIn: SignIn = {
    profileEmail: "",
    profilePassword: ""
}

const submitSignIn = async (values: SignIn, formikHelpers: FormikHelpers<SignIn>) => {
    const {resetForm, setStatus} = formikHelpers
    const result = await submitRequest(values)
    const {
        data: response, error
    } = result as { data: ClientResponseForSignIn, error: ClientResponseForSignIn }
    if (error) {
        setStatus({type: error.type, message: error.message})
    }
    else if(response?.status === 200) {
        window.localStorage.removeItem("authorization");
        window.localStorage.setItem("authorization", response.authorization as string);
        const decodedToken = jwtDecode<JwtToken>(response.authorization as string)
        dispatch(getAuth(decodedToken))
        resetForm()
        setStatus({type: response.type, message: response.message})
    } else {
    setStatus({type: response?.type, message: response?.message})}
}

return (
    <>
        <Formik initialValues={signIn} onSubmit={submitSignIn} validationSchema={validator}>
        {SignInFormContent}
        </Formik>
    </>
)

    function SignInFormContent(props: FormikProps<SignIn>) {
        const {
            status,
            values,
            // errors,
            // touched,
            // dirty,
            // isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
            // handleReset
        } = props;

    return (
        <>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className={"mb-3"} controlId="formHorizontalEmail">
                            <Form.Label column lg={2} className="ms-2">
                                Email
                            </Form.Label>
                            <Col lg={12}>
                                <Form.Control
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={"Email"}
                                value={values.profileEmail}
                                name={"profileEmail"}
                                type="email"
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                            <Form.Label column lg={4} className="ms-2">
                                Password
                            </Form.Label>
                            <Col lg={12}>
                                <Form.Control
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={"Password"}
                                value={values.profileEmail}
                                name={"profilePassword"}
                                type="password"
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Col lg={"12"}>
                                <Button variant={"secondary"} type={"submit"}>Sign in</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                    <DisplayStatus status={status}/>
                    <FormDebugger {...props}/>
        </>
    )
}
}