
layout(location=20) uniform int nb_emissives;
layout(location=21) uniform int NB_BOUNCES;
layout(location=23) uniform float initial_ratio;


float FresnelSchlick(in vec3 D, in vec3 N){
	// R0 = (n1 - n2 / n1 + n2)2, mais on a n = n1/n2 donc R0 = (n-1/n+1)2
	float r0 = (initial_ratio - 1.0)/(initial_ratio + 1.0);
	r0 *= r0;
	float cosi = 1.0 + dot(D,N);
	cosi = cosi * cosi * cosi * cosi * cosi;
	return clamp(r0 + (1.0-r0)*cosi, 0.0, 1.0);
}


vec3 sample_hemisphere(float r)
{
    // Algorithme d'échantillonnage uniforme de l'hémisphère
	float Z = random_float();
	float beta = acos(2 * Z - 1) / 2 * (1-r);
	float alpha = radians(random_float() * 360) * (1-r);
	
	return normalize(vec3(sin(beta) * cos(alpha), sin(beta) * sin(alpha), cos(beta)));
}

vec3 random_ray(in vec3 D, float r)
{
    // Algorithme d'orientation de l'échantillon
	vec3 W;
	do {

		W = normalize(random_vec3());

	} while(abs(dot(W, D)) == 0.0);


	vec3 U = normalize(cross(D, W));
	vec3 V = normalize(cross(U, D));
	mat3 M = mat3(U, V, D); // Matrice de changement de repère 3x3

    return normalize(M * sample_hemisphere(r));
}


vec3 random_path(in vec3 D, in vec3 O)
{
	vec3 total = vec3(0);
    float attenu = 1.0;
	float attbri = 1.0;
	int i;
	for(i=0; i<NB_BOUNCES; ++i){
		traverse_all_bvh(O,D);
		
		if(!hit()){
			return total + attbri * mix (vec3(0.1,0.1,0.5),vec3(0.4,0.4,0.9),max(0.0,(0.5+D.z)/1.5));
		}


		vec3 N;
        vec3 P;
        intersection_info(N,P);
		N = normalize(N);
        vec4 color = intersection_color_info();
        vec4 mat = intersection_mat_info();
		vec3 local = color.rgb;
		total += (1.0-mat.r) * local * attenu * attbri * color.a;
		if(mat.b > 0.0)
			return total * mat.b;
		float fr = FresnelSchlick(D, N);
		// if object is not completly opac and the reflectance ratio is not max (1.0) on traverse
		if(fr < 1.0 && color.a < 1.0){

			if(color.a >= 0.5)
				attenu *= 0.3 + 0.9*max(0.0,dot(D,N));

			attbri *= (1.0-color.a) * (1.0-fr); // transparence et fresnel approximation attenuation

			O = P-BIAS*N;
			D = normalize(refract(D,N,1.0/initial_ratio));
			
			traverse_all_bvh(O,D);
			intersection_info(N,P);

			// invert ration with N going the opposite direction
			O = P + BIAS*N;
			D = normalize(refract(D,-N,initial_ratio));
		}
		else {
			attenu *=  0.2 + 0.9 *max(0.0,dot(D,N));
			attbri *= mat.r;
			O = P+BIAS*N;
			vec3 refray = reflect(D, N);
			D = random_ray(refray, mat.g);
		}
	}

	return total * 0.1;
		

}

vec3 raytrace(in vec3 Dir, in vec3 Orig)   
{
	// init de la graine du random
	srand();
	// calcul de la lumière captée par un chemin aléatoire
	return random_path(normalize(Dir),Orig);
}

